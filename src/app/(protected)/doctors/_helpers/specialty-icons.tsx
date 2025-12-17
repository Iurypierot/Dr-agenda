import {
  Baby,
  Brain,
  Heart,
  Eye,
  Stethoscope,
  Activity,
  Pill,
  Syringe,
  User,
  Sparkles,
  Dumbbell,
  Shield,
  Scissors,
  Microscope,
  X,
  type LucideIcon,
} from "lucide-react";

import { MedicalSpecialty } from "../_constants";

export const getSpecialtyIcon = (
  specialty: string,
): LucideIcon | null => {
  const specialtyMap: Record<string, LucideIcon> = {
    [MedicalSpecialty.PEDIATRIA]: Baby,
    [MedicalSpecialty.CIRURGIA_PEDIATRICA]: Baby,
    [MedicalSpecialty.CARDIOLOGIA]: Heart,
    [MedicalSpecialty.CIRURGIA_CARDIOVASCULAR]: Heart,
    [MedicalSpecialty.NEUROLOGIA]: Brain,
    [MedicalSpecialty.NEUROCIRURGIA]: Brain,
    [MedicalSpecialty.PSIQUIATRIA]: Brain,
    [MedicalSpecialty.OFTALMOLOGIA]: Eye,
    [MedicalSpecialty.ORTOPEDIA_TRAUMATOLOGIA]: Activity,
    [MedicalSpecialty.MEDICINA_DO_ESPORTO]: Dumbbell,
    [MedicalSpecialty.CIRURGIA_GERAL]: Scissors,
    [MedicalSpecialty.CIRURGIA_PLASTICA]: Scissors,
    [MedicalSpecialty.CIRURGIA_DIGESTIVA]: Scissors,
    [MedicalSpecialty.CIRURGIA_TORACICA]: Scissors,
    [MedicalSpecialty.CIRURGIA_VASCULAR]: Scissors,
    [MedicalSpecialty.CIRURGIA_CABECA_PESCOCO]: Scissors,
    [MedicalSpecialty.ANESTESIOLOGIA]: Syringe,
    [MedicalSpecialty.INFECTOLOGIA]: Pill,
    [MedicalSpecialty.ONCOLOGIA_CLINICA]: Shield,
    [MedicalSpecialty.CANCEROLOGIA]: Shield,
    [MedicalSpecialty.RADIOLOGIA]: Microscope,
    [MedicalSpecialty.RADIOTERAPIA]: Microscope,
    [MedicalSpecialty.PATOLOGIA]: Microscope,
    [MedicalSpecialty.PATOLOGIA_CLINICA]: Microscope,
    [MedicalSpecialty.ENDOSCOPIA]: Microscope,
    [MedicalSpecialty.HOMEOPATIA]: Sparkles,
    [MedicalSpecialty.GERIATRIA]: User,
    [MedicalSpecialty.MEDICINA_DE_FAMILIA]: User,
    [MedicalSpecialty.CLINICA_MEDICA]: Stethoscope,
  };

  return specialtyMap[specialty] || Stethoscope;
};












