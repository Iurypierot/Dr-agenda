import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
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
  time: z.string().optional(), // Deixar opcional por enquanto, como solicitado
});

export type UpsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>;

