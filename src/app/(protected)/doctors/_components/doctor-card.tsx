"use client";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { CalendarIcon, ClockIcon, DollarSignIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import UpsertDoctorForm from "./upsert-doctor-fotm";

dayjs.extend(isBetween);

interface DoctorCardProps {
  doctor: typeof doctorsTable.$inferSelect;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const availability = getAvailability(doctor);
  const isAvailable = dayjs().isBetween(availability.from, availability.to);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{doctorInitials}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-sm font-medium">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-2">
        {/* Dias da semana */}
        <Badge variant="outline">
          <CalendarIcon className="mr-1" />
          {availability.from.format("dddd")} a {availability.to.format("dddd")}
        </Badge>

        {/* Horários */}
        <Badge variant="outline">
          <ClockIcon className="mr-1" />
          {availability.from.format("HH:mm")} às{" "}
          {availability.to.format("HH:mm")}
        </Badge>

        {/* Preço */}
        <Badge variant="outline">
          <DollarSignIcon className="mr-1" />
          {formatCurrency(doctor.appointmentPriceInCents)}
        </Badge>

        {/* Status */}
        <Badge
          variant={isAvailable ? "default" : "destructive"}
          className="mt-1"
        >
          {isAvailable ? "Disponível agora" : "Fora do horário"}
        </Badge>
      </CardContent>

      <Separator />

      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
          </DialogTrigger>

          <UpsertDoctorForm isOpen={false} doctor={doctor} />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
