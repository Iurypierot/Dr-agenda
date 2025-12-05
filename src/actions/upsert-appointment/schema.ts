import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid({
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  appointmentPriceInCents: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  time: z.string().optional(),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;

