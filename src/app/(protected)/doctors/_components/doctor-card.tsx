"use client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { CalendarIcon, ClockIcon, DollarSignIcon, Trash } from "lucide-react";
import { useState } from "react";

import { deleteDoctor } from "@/actions/delete-doctor/index";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { doctorsTable } from "@/db/schema";
import { formatCurrency } from "@/helprs/currency";

import { getAvailability } from "../_helpers/availability";
import { getSpecialtyIcon } from "../_helpers/specialty-icons";
import UpsertDoctorForm from "./upsert-doctor-fotm";

dayjs.extend(isBetween);

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const [isUpsertDoctorDialogOpen, setIsUpserDoctorDialogOpen] =
    useState(false);

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(doctor);
  const SpecialtyIcon = getSpecialtyIcon(doctor.specialty);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            {doctor.avatarImageUrl && (
              <AvatarImage src={doctor.avatarImageUrl} alt={doctor.name} />
            )}
            <AvatarFallback className="text-lg">{doctorInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-base font-semibold">{doctor.name}</h3>
            <div className="flex items-center gap-2">
              {SpecialtyIcon && (
                <SpecialtyIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} a {availability.to.format("dddd")}
        </Badge>

        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} às{" "}
          {availability.to.format("HH:mm")}
        </Badge>

        <Badge variant="outline">
          <DollarSignIcon className="mr-1" />
          {formatCurrency(doctor.appointmentPriceInCents)}
        </Badge>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col gap-2">
        {/* Ver detalhes */}
        <Dialog
          open={isUpsertDoctorDialogOpen}
          onOpenChange={setIsUpserDoctorDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
          </DialogTrigger>

          <UpsertDoctorForm
            doctor={{
              ...doctor,
              availableToTime: availability.to.format("HH:mm:ss"),
              availableFromTime: availability.from.format("HH:mm:ss"),
            }}
            onSuccess={() => setIsUpserDoctorDialogOpen(false)}
            isOpen={false}
          />
        </Dialog>

        {/* Excluir */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Trash className="mr-2 h-4 w-4" /> Excluir
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O médico será removido
                permanentemente do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>

              <AlertDialogAction
                onClick={() => deleteDoctor({ id: doctor.id })}
              >
                Confirmar exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
