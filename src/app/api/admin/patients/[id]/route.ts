import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const patientId = Number(id);

    // 2. Validate that it's actually a number
    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID format" },
        { status: 400 },
      );
    }
    const repo = getPatientDataRepository();
    const patient = await repo.getPatientByIdAsync(patientId);

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          insurancePayer: patient.insurancePayer,
          diagnosisCode: patient.diagnosisCode,
          procedureCode: patient.procedureCode,
          procedureName: patient.procedureName,
        },
        notes: patient.notes,
        medications: patient.medications,
        imaging: patient.imagingReports,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/patients/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const patientId = Number((await params).id);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID" },
        { status: 400 },
      );
    }
    const repo = getPatientDataRepository();

    const isPatientDeleted = await repo.deletePatientDataByIdAsync(patientId);

    if (!isPatientDeleted) {
      return NextResponse.json({
        success: false,
        message: "Failed to Delete Patient records!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Patient and all related records deleted successfully.",
    });
  } catch (e) {
    console.error("Delete patient error:", e);

    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}


