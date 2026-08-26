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

export interface Patient {
  id: number;
  name: string;
  email: string | null;
  insurancePayer: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: number;
}
