"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertDoctorForm from "./upsert-doctor-fotm";

const AddDoctorButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus />
          Adicionar Médico
        </Button>
      </DialogTrigger>

      <UpsertDoctorForm onSuccess={() => setIsOpen(false)} isOpen={false} />
    </Dialog>
  );
};

export default AddDoctorButton;

