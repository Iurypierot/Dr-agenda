"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
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

    await db
      .insert(appointmentsTable)
      .values({
        id: parsedInput.id,
        clinicId: session.user.clinicId.id,
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: appointmentDate.toDate(),
      })
      .onConflictDoUpdate({
        target: appointmentsTable.id,
        set: {
          patientId: parsedInput.patientId,
          doctorId: parsedInput.doctorId,
          date: appointmentDate.toDate(),
        },
      });
    revalidatePath("/appointments");
  });

