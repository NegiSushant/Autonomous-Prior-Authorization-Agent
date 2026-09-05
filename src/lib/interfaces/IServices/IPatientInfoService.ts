import {
  InsertPatientFullPayload,
  PatientFullResponseDto,
  UpdatePatientFullPayload,
} from "@/types/patient.dto";
import { SessionUser } from "@/types/users.dto";
// import { PatientRecord, ClinicalEvidenceRow } from "@/types/patientRecord";

export interface IPatientInfoService {
  PatientInfoById(
    patientId: number,
    session: SessionUser,
  ): Promise<PatientFullResponseDto | null>;

  PatientInfoList(
    session: SessionUser,
  ): Promise<PatientFullResponseDto[] | null>;

  createPatientInfo(payload: InsertPatientFullPayload): Promise<boolean>;

  updatePatientInfoById(
    patientId: number,
    payload: UpdatePatientFullPayload,
  ): Promise<boolean>;

  deletePatientDataById(patientId: number): Promise<boolean>;

  // getPatient(patientId: string): Promise<PatientRecord | null>;
  // listPatients(): Promise<PatientRecord[]>;

  // searchNotes(
  //   patientId: string,
  //   keywords: string,
  // ): Promise<ClinicalEvidenceRow[]>;

  // searchMedications(
  //   patientId: string,
  //   medicationCategory: string,
  // ): Promise<ClinicalEvidenceRow[]>;

  // searchImaging(
  //   patientId: string,
  //   bodyPart: string,
  // ): Promise<ClinicalEvidenceRow[]>;
}
