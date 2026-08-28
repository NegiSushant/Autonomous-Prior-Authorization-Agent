export interface IOrganization {
  id: number;
  type: "DEMO" | "HOSPITAL" | "CLINIC" | "OTHERS";
}

export interface IPatient {
  id: number;
  name: string;
  email: string | null;
  insurancePayer: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClinicalNote {
  id: number;
  patientId: number;
  documentId: string;
  noteDate: Date;
  bodyText: string;
  sourceType: string;
  createdAt: Date;
}

export interface IMedicationRecord {
  id: number;
  patientId: number;
  documentId: string;
  drugName: string;
  category: string;
  recordDate: Date;
  status: string;
  createdAt: Date;
}

export interface IImagingReport {
  id: number;
  patientId: number;
  documentId: string;
  bodyPart: string;
  findings: string;
  reportDate: Date;
  sourceType: string;
  createdAt: Date;
}
