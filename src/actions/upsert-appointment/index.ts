"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinicId?.id) {
      throw new Error("Clinic not found");
    }

    // Combinar data e hora se houver
    let appointmentDate = dayjs(parsedInput.date);
    
    // Se houver hora, combinar com a data
    if (parsedInput.time) {
      const [hours, minutes] = parsedInput.time.split(":").map(Number);
      appointmentDate = appointmentDate
        .set("hour", hours)
        .set("minute", minutes)
        .set("second", 0);
    }

    const appointmentDateTime = appointmentDate.toDate();
    const appointmentStart = dayjs(appointmentDateTime)
      .subtract(59, "minute")
      .toDate();
    const appointmentEnd = dayjs(appointmentDateTime)
      .add(59, "minute")
      .toDate();

    // Verificar se já existe um agendamento duplicado (mesmo paciente, médico e data/hora)
    const duplicateAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinicId.id),
          eq(appointmentsTable.patientId, parsedInput.patientId),
          eq(appointmentsTable.doctorId, parsedInput.doctorId),
          gte(appointmentsTable.date, appointmentStart),
          lte(appointmentsTable.date, appointmentEnd),
        ),
      )
      .limit(1);

    if (duplicateAppointments.length > 0) {
      throw new Error(
        "Já existe um agendamento para este paciente com este médico no mesmo horário.",
      );
    }

    // Verificar se o médico já tem um agendamento no mesmo horário
    const conflictingAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinicId.id),
          eq(appointmentsTable.doctorId, parsedInput.doctorId),
          gte(appointmentsTable.date, appointmentStart),
          lte(appointmentsTable.date, appointmentEnd),
        ),
      )
      .limit(1);

    if (conflictingAppointments.length > 0) {
      throw new Error(
        "Este médico já possui um agendamento neste horário. Por favor, escolha outro horário.",
      );
    }

    await db.insert(appointmentsTable).values({
      clinicId: session.user.clinicId.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      date: appointmentDateTime,
    });
    revalidatePath("/appointments");
  });

