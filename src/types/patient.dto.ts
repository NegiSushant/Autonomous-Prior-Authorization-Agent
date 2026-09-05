import {
  IClinicalNote,
  IImagingReport,
  IMedicationRecord,
  IPatient,
} from "./patient.entity";

export type CreatePatientDto = Omit<IPatient, "id" | "createdAt" | "updatedAt">;

export type CreateClinicalNoteDto = Omit<
  IClinicalNote,
  "id" | "createdAt" | "patientId"
>;

export type CreateMedicationDto = Omit<
  IMedicationRecord,
  "id" | "createdAt" | "patientId"
>;

export type CreateImagingDto = Omit<
  IImagingReport,
  "id" | "createdAt" | "patientId"
>;

export interface InsertPatientFullPayload {
  patient: CreatePatientDto;
  notes?: CreateClinicalNoteDto[];
  medications?: CreateMedicationDto[];
  imaging?: CreateImagingDto[];
}

// Update Payloads
export interface UpdatePatientFullPayload {
  patient?: Partial<CreatePatientDto>;
  notes?: Partial<IClinicalNote>[];
  medications?: Partial<IMedicationRecord>[];
  imaging?: Partial<IImagingReport>[];
}

// Response Types
export interface PatientFullResponseDto extends IPatient {
  notes: IClinicalNote[];
  medications: IMedicationRecord[];
  imagingReports: IImagingReport[];
}
