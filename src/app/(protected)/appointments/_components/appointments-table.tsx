"use client";

import { MoreVertical, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentsTable } from "@/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { formatCurrency } from "@/helprs/currency";

dayjs.locale("pt-br");

interface AppointmentsTableProps {
  appointments: (typeof appointmentsTable.$inferSelect & {
    patient: { name: string };
    doctor: { name: string; specialty: string; appointmentPriceInCents: number };
  })[];
}

const AppointmentsTable = ({ appointments }: AppointmentsTableProps) => {
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento excluído com sucesso.");
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    },
    onError: () => {
      toast.error("Erro ao excluir agendamento.");
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">PACIENTE</TableHead>
              <TableHead className="text-center">MÉDICO</TableHead>
              <TableHead className="text-center">ESPECIALIDADE</TableHead>
              <TableHead className="text-center">DATA</TableHead>
              <TableHead className="text-center">VALOR</TableHead>
              <TableHead className="text-center">STATUS</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  Nenhum agendamento cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow
                  key={appointment.id}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="text-center font-medium">
                    {appointment.patient.name}
                  </TableCell>
                  <TableCell className="text-center">
                    Dr. {appointment.doctor.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {appointment.doctor.specialty}
                  </TableCell>
                  <TableCell className="text-center">
                    {dayjs(appointment.date).format("DD/MM/YY, HH:mm")}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(appointment.doctor.appointmentPriceInCents)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Confirmado</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {appointment.patient.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setAppointmentToDelete(appointment.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido
              permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setAppointmentToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (appointmentToDelete) {
                  deleteAppointmentAction.execute({ id: appointmentToDelete });
                }
              }}
              disabled={deleteAppointmentAction.isPending}
            >
              {deleteAppointmentAction.isPending
                ? "Excluindo..."
                : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentsTable;

