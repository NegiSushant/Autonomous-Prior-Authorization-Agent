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

export interface ClinicalNote {
  id?: number;
  patientId?: number;
  documentId: string;
  noteDate: Date;
  bodyText: string;
  sourceType?: string;
  createdAt?: Date;
}

export interface MedicationRecordData {
  id?: number;
  patientId?: number;
  documentId: string;
  drugName: string;
  category: string;
  recordDate: string;
  createdAt?: Date;
  status?: string;
}

export interface ImagingReportData {
  id?: number;
  patientId?: number;
  documentId: string;
  bodyPart: string;
  findings: string;
  reportDate: string;
  sourceType?: string;
  createdAt?: Date;
}

export interface PatientFullInformation {
  patientData: Patient[];
  notes: ClinicalNote[];
  MedicationRecord: MedicationRecordData[];
  ImagingReport: ImagingReportData[];
}
