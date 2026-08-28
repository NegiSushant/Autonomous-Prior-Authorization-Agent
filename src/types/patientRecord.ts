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
  email?: string | null;
  insurancePayer: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  organizationId: number | string;
}

export interface ClinicalNote {
  id?: number;
  patientId?: number;
  documentId: string;
  noteDate: Date;
  bodyText: string;
  sourceType?: string;
  createdAt?: Date;
}
