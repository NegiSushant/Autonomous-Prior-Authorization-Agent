import { Patient } from "@/types/patientRecord";

export interface IPatientDataRepository {
  getPatientByIdAsync(patientId: number): Promise<Patient | null>;
  insertPatientDataByIdAsync(patientId: number): Promise<null>;
  deletePatientDataByIdAsync(patientId: number): Promise<boolean>;
}
