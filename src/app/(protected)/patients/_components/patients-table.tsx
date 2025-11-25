"use client";

import { Eye, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePatient } from "@/actions/delete-patient";
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
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { patientsTable } from "@/db/schema";

import UpsertPatientForm from "./upsert-patient-form";

interface PatientsTableProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const formatPhoneNumber = (phone: string) => {
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return phone;
};

const PatientsTable = ({ patients }: PatientsTableProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success("Paciente excluído com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir paciente.");
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Nome</TableHead>
              <TableHead className="text-center">E-mail</TableHead>
              <TableHead className="text-center">Número Telefone</TableHead>
              <TableHead className="text-center">Sexo</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum paciente cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50">
                  <TableCell className="text-center font-medium">
                    {patient.name}
                  </TableCell>
                  <TableCell className="text-center">{patient.email}</TableCell>
                  <TableCell className="text-center">
                    {formatPhoneNumber(patient.phoneNumber)}
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.sex === "male" ? "Masculino" : "Feminino"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O paciente será
                              removido permanentemente do sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deletePatientAction.execute({ id: patient.id })
                              }
                              disabled={deletePatientAction.isPending}
                            >
                              {deletePatientAction.isPending
                                ? "Excluindo..."
                                : "Confirmar exclusão"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedPatient && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <UpsertPatientForm
            patient={selectedPatient}
            isOpen={isDialogOpen}
            onSuccess={() => {
              setIsDialogOpen(false);
              setSelectedPatientId(null);
            }}
          />
        </Dialog>
      )}
    </>
  );
};

export default PatientsTable;

