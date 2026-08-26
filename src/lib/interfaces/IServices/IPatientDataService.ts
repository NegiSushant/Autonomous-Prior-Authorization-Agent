import { PatientRecord, ClinicalEvidenceRow } from "@/types/patientRecord";

export interface IPatientDataService {
  getPatient(patientId: string): Promise<PatientRecord | null>;
  listPatients(): Promise<PatientRecord[]>;

  searchNotes(
    patientId: string,
    keywords: string,
  ): Promise<ClinicalEvidenceRow[]>;

  searchMedications(
    patientId: string,
    medicationCategory: string,
  ): Promise<ClinicalEvidenceRow[]>;

  searchImaging(
    patientId: string,
    bodyPart: string,
  ): Promise<ClinicalEvidenceRow[]>;
}
