import { getPatientDataRepository } from "@/di/reposetriesDiI";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { IPatientInfoService } from "@/lib/interfaces/IServices/IPatientInfoService";
import {
  InsertPatientFullPayload,
  PatientFullResponseDto,
  UpdatePatientFullPayload,
} from "@/types/patient.dto";
import { SessionUser } from "@/types/users.dto";

export class PatientInfoServices implements IPatientInfoService {
  private repository: IPatientDataRepository;

  constructor() {
    this.repository = getPatientDataRepository();
  }

  async PatientInfoById(
    patientId: number,
    session: SessionUser,
  ): Promise<PatientFullResponseDto | null> {
    try {
      let orgId: number | null = null;
      if (session.role === "REVIEWER" || session.role === "ADMIN") {
        orgId = session.orgId;
      }
      const patients = await this.repository.getPatientByIdAsync(
        patientId,
        orgId,
      );
      return patients;
    } catch (error) {
      console.error("Error while retriving patient: ", error);
      return null;
    }
  }

  async PatientInfoList(
    session: SessionUser,
  ): Promise<PatientFullResponseDto[] | null> {
    try {
      let orgId: number | null = null;
      if (session.role === "REVIEWER" || session.role === "ADMIN") {
        orgId = session.orgId;
      }

      const patients = this.repository.getFullPatientInfoAsync(orgId);
      return patients;
    } catch (error) {
      console.error("Error while retriving patients: ", error);
      return null;
    }
  }

  async createPatientInfo(payload: InsertPatientFullPayload): Promise<boolean> {
    try {
      const isPatientCreated =
        await this.repository.insertPatientDataAsync(payload);
      if (!isPatientCreated) return false;
      return true;
    } catch (error) {
      console.error("Error while creating patient: ", error);
      return false;
    }
  }

  async updatePatientInfoById(
    patientId: number,
    payload: UpdatePatientFullPayload,
  ): Promise<boolean> {
    try {
      const isPatientUpdated = await this.repository.updatePatientDataByIdAsync(
        patientId,
        payload,
      );
      if (!isPatientUpdated) return false;
      return true;
    } catch (error) {
      console.error("Error while updating patient info: ", error);
      return false;
    }
  }

  async deletePatientDataById(patientId: number): Promise<boolean> {
    try {
      const isPatientDeleted =
        await this.repository.deletePatientDataByIdAsync(patientId);
      if (!isPatientDeleted) return false;
      return true;
    } catch (error) {
      console.error("Error while updating deleting info: ", error);
      return false;
    }
  }
}
