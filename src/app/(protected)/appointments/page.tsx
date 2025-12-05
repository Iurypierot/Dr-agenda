import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./_components/add-appointment-button";
import AppointmentsTable from "./_components/appointments-table";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinicId) {
    redirect("/clinic-form");
  }

  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinicId.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinicId.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session.user.clinicId.id),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: (appointments, { desc: descFn }) => [descFn(appointments.date)],
    }),
  ]);

  // Ordenar por nome em ordem alfabética
  const sortedPatients = patients.sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  const sortedDoctors = doctors.sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>Gerencie os agendamentos da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton
            patients={sortedPatients}
            doctors={sortedDoctors}
          />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AppointmentsTable appointments={appointments} />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;

