import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

// 1. Define the types for the incoming request data
interface ClinicalNotePayload {
  documentId: string;
  noteDate: string | Date;
  bodyText: string;
  sourceType?: string;
}

interface MedicationPayload {
  documentId: string;
  drugName: string;
  category: string;
  recordDate: string;
  status?: string;
}

interface ImagingPayload {
  documentId: string;
  bodyPart: string;
  findings: string;
  reportDate: string;
  sourceType?: string;
}

export async function GET() {
  try {
    // await requireAdmin();
    const patients = await prismaClient.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            notes: true,
            medications: true,
            imagingReports: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: patients });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const repo = getPatientDataRepository();

    const success = await repo.insertPatientDataAsync({
      patient: body.patient,
      notes: body.notes,
      medications: body.medications,
      imaging: body.imaging,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to create patient" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });

    // const newPatient = await prismaClient.patient.create({
    //   data: {
    //     // 1. Core Patient Data (Prisma auto-generates the ID)
    //     name: patient.name,
    //     email: patient.email || undefined,
    //     insurancePayer: patient.insurancePayer,
    //     procedureCode: patient.procedureCode,
    //     procedureName: patient.procedureName,
    //     diagnosisCode: patient.diagnosisCode,
    //     organizationId: Number(patient.organizationId),

    //     // 2. Clincal notes
    //     notes:
    //       notes?.length > 0
    //         ? {
    //             create: notes.map((n: ClinicalNotePayload) => ({
    //               documentId: n.documentId,
    //               noteDate: new Date(n.noteDate),
    //               bodyText: n.bodyText,
    //               sourceType: n.sourceType || "EHR",
    //             })),
    //           }
    //         : undefined,

    //     // 3. medications
    //     medications:
    //       medications?.length > 0
    //         ? {
    //             create: medications.map((m: MedicationPayload) => ({
    //               documentId: m.documentId,
    //               drugName: m.drugName,
    //               category: m.category,
    //               recordDate: m.recordDate,
    //               status: m.status || "active",
    //             })),
    //           }
    //         : undefined,

    //     // 4. imaging reports
    //     imagingReports:
    //       imaging?.length > 0
    //         ? {
    //             create: imaging.map((i: ImagingPayload) => ({
    //               documentId: i.documentId,
    //               bodyPart: i.bodyPart,
    //               findings: i.findings,
    //               reportDate: i.reportDate,
    //               sourceType: i.sourceType || "Imaging",
    //             })),
    //           }
    //         : undefined,
    //   },
    // });
    // return NextResponse.json({ success: true, data: newPatient });
  } catch (e) {
    console.error("Bulk create error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
