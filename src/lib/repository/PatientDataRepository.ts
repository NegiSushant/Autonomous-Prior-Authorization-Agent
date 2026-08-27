import {
  InsertPatientPayload,
  Patient,
  PatientFullInformation,
} from "@/types/patientRecord";
import { IPatientDataRepository } from "../interfaces/IRepository/IPatientDataRepository";
import prismaClient from "@/lib/prisma";

export class PatientDataRepository implements IPatientDataRepository {
  async insertPatientDataAsync(
    payload: InsertPatientPayload,
  ): Promise<boolean> {
    try {
      const { patient, notes, medications, imaging } = payload;

      await prismaClient.patient.create({
        data: {
          // 1. Core Patient Data
          name: patient.name,
          email: patient.email || undefined,
          insurancePayer: patient.insurancePayer,
          procedureCode: patient.procedureCode,
          procedureName: patient.procedureName,
          diagnosisCode: patient.diagnosisCode,
          organizationId: Number(patient.organizationId),

          // 2. Clinical notes
          notes:
            notes && notes.length > 0
              ? {
                  create: notes.map((n) => ({
                    documentId: n.documentId,
                    noteDate: new Date(n.noteDate),
                    bodyText: n.bodyText,
                    sourceType: n.sourceType || "EHR",
                  })),
                }
              : undefined,

          // 3. Medications
          medications:
            medications && medications.length > 0
              ? {
                  create: medications.map((m) => ({
                    documentId: m.documentId,
                    drugName: m.drugName,
                    category: m.category,
                    recordDate: m.recordDate,
                    status: m.status || "active",
                  })),
                }
              : undefined,

          // 4. Imaging reports
          imagingReports:
            imaging && imaging.length > 0
              ? {
                  create: imaging.map((i) => ({
                    documentId: i.documentId,
                    bodyPart: i.bodyPart,
                    findings: i.findings,
                    reportDate: i.reportDate,
                    sourceType: i.sourceType || "Imaging",
                  })),
                }
              : undefined,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to insert patient data:", error);
      return false;
    }
  }
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

  async getFullPatientInfoAsync(): Promise<PatientFullInformation[] | null> {
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
      console.error("Failed to fetch full patient info:", error);
      return null;
    }
  }
}
