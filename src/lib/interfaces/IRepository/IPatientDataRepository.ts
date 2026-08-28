import {
  InsertPatientFullPayload,
  PatientFullResponseDto,
  UpdatePatientFullPayload,
} from "@/types/patient.dto";

export interface IPatientDataRepository {
  /*-----------------------Read Ops ----------------- */
  getPatientByIdAsync(
    patientId: number,
  ): Promise<PatientFullResponseDto | null>;
  getFullPatientInfoAsync(): Promise<PatientFullResponseDto[] | null>;

  /*-----------------------Write ops----------------- */
  insertPatientDataAsync(payload: InsertPatientFullPayload): Promise<boolean>;
  updatePatientDataByIdAsync(
    patientId: number,
    payload: UpdatePatientFullPayload,
  ): Promise<boolean>;
  deletePatientDataByIdAsync(patientId: number): Promise<boolean>;
}
