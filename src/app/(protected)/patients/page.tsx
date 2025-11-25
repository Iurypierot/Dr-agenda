import { eq } from "drizzle-orm";
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
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import PatientsTable from "./_components/patients-table";

const PatientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinicId) {
    redirect("/clinic-form");
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinicId.id),
  });

  // Ordenar por nome em ordem alfabética
  const sortedPatients = patients.sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>Gerencie os pacientes da sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PatientsTable patients={sortedPatients} />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

