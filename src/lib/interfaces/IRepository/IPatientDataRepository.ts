import {
  InsertPatientFullPayload,
  PatientFullResponseDto,
  UpdatePatientFullPayload,
} from "@/types/patient.dto";
import { IClinicalNote, IImagingReport, IMedicationRecord } from "@/types/patient.entity";

export interface IPatientDataRepository {
  /*-----------------------Read Ops ----------------- */
  getPatientByIdAsync(
    patientId: number,
    orgId: number | null,
  ): Promise<PatientFullResponseDto | null>;

  getFullPatientInfoAsync(
    orgId: number | null,
  ): Promise<PatientFullResponseDto[] | null>;

  getEHRNoteData(patientId: number): Promise<IClinicalNote[] | null>;

  getPharmacyRecord(patientId: number): Promise<IMedicationRecord[] | null>;

  getImagingData(patientId: number): Promise<IImagingReport[] | null>;

  /*-----------------------Write ops----------------- */
  insertPatientDataAsync(payload: InsertPatientFullPayload): Promise<boolean>;

  updatePatientDataByIdAsync(
    patientId: number,
    payload: UpdatePatientFullPayload,
  ): Promise<boolean>;

  deletePatientDataByIdAsync(patientId: number): Promise<boolean>;
}
