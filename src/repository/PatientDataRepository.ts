import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import prismaClient from "@/lib/prisma";
import {
  InsertPatientFullPayload,
  PatientFullResponseDto,
  UpdatePatientFullPayload,
} from "@/types/patient.dto";

export class PatientDataRepository implements IPatientDataRepository {
  /*------------------ Write Ops------------- */

  // Bulk insert patient Data
  async insertPatientDataAsync(
    payload: InsertPatientFullPayload,
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
                    recordDate: new Date(m.recordDate),
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
                    reportDate: new Date(i.reportDate),
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

  // update the patient information
  async updatePatientDataByIdAsync(
    patientId: number,
    payload: UpdatePatientFullPayload,
  ): Promise<boolean> {
    try {
      const { patient, notes, medications, imaging } = payload;

      await prismaClient.patient.update({
        where: { id: patientId },
        data: {
          // 1. Core Patient Data (Only updates fields that were provided)
          ...(patient && {
            name: patient.name,
            email: patient.email,
            insurancePayer: patient.insurancePayer,
            procedureCode: patient.procedureCode,
            procedureName: patient.procedureName,
            diagnosisCode: patient.diagnosisCode,
            ...(patient.organizationId && {
              organizationId: Number(patient.organizationId),
            }),
          }),

          // 2. Clinical Notes (Upsert: Updates existing if ID matches, creates new if ID is missing/0)
          ...(notes &&
            notes.length > 0 && {
              notes: {
                upsert: notes.map((n) => ({
                  where: { id: n.id || -1 }, // -1 ensures it acts as a 'create' if no ID is passed
                  update: {
                    documentId: n.documentId,
                    bodyText: n.bodyText,
                    sourceType: n.sourceType,
                    ...(n.noteDate && { noteDate: new Date(n.noteDate) }),
                  },
                  create: {
                    documentId: n.documentId!,
                    bodyText: n.bodyText!,
                    noteDate: new Date(n.noteDate!),
                    sourceType: n.sourceType || "EHR",
                  },
                })),
              },
            }),

          // 3. Medications (Upsert)
          ...(medications &&
            medications.length > 0 && {
              medications: {
                upsert: medications.map((m) => ({
                  where: { id: m.id || -1 },
                  update: {
                    documentId: m.documentId,
                    drugName: m.drugName,
                    category: m.category,
                    status: m.status,
                    ...(m.recordDate && { recordDate: new Date(m.recordDate) }),
                  },
                  create: {
                    documentId: m.documentId!,
                    drugName: m.drugName!,
                    category: m.category!,
                    recordDate: new Date(m.recordDate!),
                    status: m.status || "active",
                  },
                })),
              },
            }),

          // 4. Imaging Reports (Upsert)
          ...(imaging &&
            imaging.length > 0 && {
              imagingReports: {
                upsert: imaging.map((i) => ({
                  where: { id: i.id || -1 },
                  update: {
                    documentId: i.documentId,
                    bodyPart: i.bodyPart,
                    findings: i.findings,
                    sourceType: i.sourceType,
                    ...(i.reportDate && { reportDate: new Date(i.reportDate) }),
                  },
                  create: {
                    documentId: i.documentId!,
                    bodyPart: i.bodyPart!,
                    findings: i.findings!,
                    reportDate: new Date(i.reportDate!),
                    sourceType: i.sourceType || "Imaging",
                  },
                })),
              },
            }),
        },
      });

      return true;
    } catch (error) {
      console.error(
        `Failed to update patient data for ID ${patientId}:`,
        error,
      );
      return false;
    }
  }

  // Delete patient by patient ID
  async deletePatientDataByIdAsync(patientId: number): Promise<boolean> {
    try {
      await prismaClient.patient.delete({
        where: { id: patientId },
      });

      return true;
    } catch (error) {
      console.error("Failed to Delete patient:", error);
      return false;
    }
  }

  /*----------------- Read Ops ----------------------- */

  //retrive all patient information
  async getFullPatientInfoAsync(): Promise<PatientFullResponseDto[] | null> {
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

  //retrive patient info by patient id
  async getPatientByIdAsync(
    patientId: number,
  ): Promise<PatientFullResponseDto | null> {
    try {
      const patientData = await prismaClient.patient.findUnique({
        where: { id: patientId },
        include: {
          notes: true,
          medications: true,
          imagingReports: true,
        },
      });

      return patientData;
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      return null;
    }
  }
}
