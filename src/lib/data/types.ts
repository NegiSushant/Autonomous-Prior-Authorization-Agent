export interface ClinicalEvidenceRow {
  documentId: string;
  dateFound: Date;
  snippetText: string;
  sourceType: string;
  status?: string;
}

export interface PatientRecord {
  patientId: string;
  name: string;
  insurancePayer: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
}

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