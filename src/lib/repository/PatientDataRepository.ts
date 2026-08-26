import { Patient, PatientFullInformation } from "@/types/patientRecord";
import { IPatientDataRepository } from "../interfaces/IRepository/IPatientDataRepository";
import prismaClient from "@/lib/prisma";

export class PatientDataRepository implements IPatientDataRepository {
  async getPatientByIdAsync(patientId: number): Promise<Patient | null> {
    try {
      const patientData = await prismaClient.patient.findUnique({
        where: { id: patientId },
      });

      return patientData;
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      return null;
    }
  }

  async insertPatientDataByIdAsync(patientId: number): Promise<null> {
    return null;
  }

  async deletePatientDataByIdAsync(patientId: number): Promise<boolean> {
    return true;
  }

  async insertPatientDataAsync(): Promise<boolean | false> {
    return true;
  }

  async getFullPatientInfoAsync(): Promise<PatientFullInformation | null> {
    try {
      const patients = await prismaClient.patient.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          notes: true,
          medications: true,
          imagingReports: true,
        },
      });

      return patients;
    } catch (error) {
      return null;
    }
  }
}
