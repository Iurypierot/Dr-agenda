"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";

dayjs.extend(utc);
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid({
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  appointmentPrice: z.number().min(0.01, {
    message: "Valor da consulta é obrigatório.",
  }),
  time: z.string().optional(),
});

interface UpsertAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  patients,
  doctors,
  onSuccess,
  isOpen,
}: UpsertAppointmentFormProps) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: undefined,
      doctorId: undefined,
      date: undefined,
      appointmentPrice: 0,
      time: undefined,
    },
  });

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === form.watch("doctorId"),
  );

  const selectedDate = form.watch("date");

  // Gerar horários disponíveis baseado no médico selecionado e data selecionada
  const availableTimes = (() => {
    if (!selectedDoctor || !selectedDate) return [];
    
    // Verificar se a data selecionada está dentro dos dias da semana que o médico trabalha
    // dayjs: 0 = domingo, 1 = segunda, 2 = terça, ..., 6 = sábado
    // banco: 0 = domingo, 1 = segunda, 2 = terça, ..., 6 = sábado
    const selectedDateWeekDay = dayjs(selectedDate).day(); // 0-6 (domingo-sábado)
    
    // Verificar se o dia da semana está dentro do range do médico
    const fromWeekDay = selectedDoctor.availableFromWeekDay;
    const toWeekDay = selectedDoctor.availableToWeekDay;
    
    // Se o range cruza o domingo (ex: sexta a segunda)
    const isWeekendRange = fromWeekDay > toWeekDay;
    
    let isDateValid = false;
    if (isWeekendRange) {
      // Range que cruza o domingo (ex: 5 (sexta) a 1 (segunda))
      isDateValid = selectedDateWeekDay >= fromWeekDay || selectedDateWeekDay <= toWeekDay;
    } else {
      // Range normal (ex: 1 (segunda) a 5 (sexta))
      isDateValid = selectedDateWeekDay >= fromWeekDay && selectedDateWeekDay <= toWeekDay;
    }
    
    if (!isDateValid) return [];
    
    // Gerar horários baseados no horário de trabalho do médico
    // Os horários estão salvos em UTC no banco, precisamos converter para local
    const fromTimeUTC = dayjs()
      .utc()
      .set("hour", Number(selectedDoctor.availableFromTime.split(":")[0]))
      .set("minute", Number(selectedDoctor.availableFromTime.split(":")[1]))
      .set("second", Number(selectedDoctor.availableFromTime.split(":")[2] || 0))
      .local();
    
    const toTimeUTC = dayjs()
      .utc()
      .set("hour", Number(selectedDoctor.availableToTime.split(":")[0]))
      .set("minute", Number(selectedDoctor.availableToTime.split(":")[1]))
      .set("second", Number(selectedDoctor.availableToTime.split(":")[2] || 0))
      .local();
    
    const fromHour = fromTimeUTC.hour();
    const fromMinute = fromTimeUTC.minute();
    const toHour = toTimeUTC.hour();
    const toMinute = toTimeUTC.minute();
    
    const times: string[] = [];
    let currentHour = fromHour;
    let currentMinute = fromMinute;
    
    while (
      currentHour < toHour ||
      (currentHour === toHour && currentMinute <= toMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      times.push(timeString);
      
      // Incrementar em 1 hora
      currentHour += 1;
      if (currentHour >= 24) break;
    }
    
    return times;
  })();

  // Atualizar o valor da consulta quando o médico for selecionado
  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPrice",
        selectedDoctor.appointmentPriceInCents / 100,
      );
    }
  }, [selectedDoctor, form]);

  // Limpar horário quando a data mudar
  useEffect(() => {
    if (selectedDate) {
      form.setValue("time", undefined);
    }
  }, [selectedDate, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: undefined,
        doctorId: undefined,
        date: undefined,
        appointmentPrice: 0,
        time: undefined,
      });
      setSelectedDoctorId(undefined);
    } else {
      form.reset({
        patientId: undefined,
        doctorId: undefined,
        date: undefined,
        appointmentPrice: 0,
        time: undefined,
      });
      setSelectedDoctorId(undefined);
    }
  }, [isOpen, form]);

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAppointmentAction.execute({
      ...values,
      appointmentPriceInCents: Math.round(values.appointmentPrice * 100),
    });
  };

  const patientId = form.watch("patientId");
  const doctorId = form.watch("doctorId");
  const date = form.watch("date");

  const isPatientAndDoctorSelected = !!patientId && !!doctorId;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Preencha os dados para criar um novo agendamento.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedDoctorId(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value.floatValue || 0);
                    }}
                    decimalScale={2}
                    fixedDecimalScale
                    decimalSeparator=","
                    allowNegative={false}
                    allowLeadingZeros={false}
                    thousandSeparator="."
                    customInput={Input}
                    prefix="R$"
                    placeholder="0,00"
                    disabled={!doctorId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        data-empty={!field.value}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={!isPatientAndDoctorSelected}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          dayjs(field.value).locale("pt-br").format("DD [de] MMMM [de] YYYY")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                      disabled={(date) => {
                        const today = dayjs().startOf("day");
                        const dateToCheck = dayjs(date);
                        
                        // Desabilitar dias passados
                        if (dateToCheck.isBefore(today, "day")) {
                          return true;
                        }
                        
                        // Se não houver médico selecionado, permitir todas as datas futuras
                        if (!selectedDoctor) {
                          return false;
                        }
                        
                        // Verificar se o dia da semana está dentro dos dias que o médico trabalha
                        const dateWeekDay = dateToCheck.day(); // 0-6 (domingo-sábado)
                        const fromWeekDay = selectedDoctor.availableFromWeekDay;
                        const toWeekDay = selectedDoctor.availableToWeekDay;
                        
                        // Se o range cruza o domingo (ex: sexta a segunda)
                        const isWeekendRange = fromWeekDay > toWeekDay;
                        
                        if (isWeekendRange) {
                          // Range que cruza o domingo (ex: 5 (sexta) a 1 (segunda))
                          return !(dateWeekDay >= fromWeekDay || dateWeekDay <= toWeekDay);
                        } else {
                          // Range normal (ex: 1 (segunda) a 5 (sexta))
                          return !(dateWeekDay >= fromWeekDay && dateWeekDay <= toWeekDay);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isPatientAndDoctorSelected}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent side="top">
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                        Nenhum horário disponível
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={upsertAppointmentAction.isPending}>
              {upsertAppointmentAction.isPending
                ? "Salvando..."
                : "Criar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;

