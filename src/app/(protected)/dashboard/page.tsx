import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import SignOutButton from "./components/sign-out-button";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinicId) {
    redirect("/clinic-form");
  }
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>Bem-vindo ao sistema de gestão da clínica</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="space-y-4">
          <div className="rounded-md border p-4 sm:p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-semibold">{session?.user?.name}</p>
            </div>
          </div>
          <div className="rounded-md border p-4 sm:p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="text-lg font-semibold">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <SignOutButton />
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
