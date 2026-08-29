import { NextResponse, NextRequest } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getPatientrService } from "@/di/servicesDil";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth(["ADMIN", "SUPERADMIN", "REVIEWER"]);

    const { id } = await params;
    const patientId = Number(id);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID format" },
        { status: 400 },
      );
    }

    const services = getPatientrService();
    const patient = await services.PatientInfoById(patientId, user);

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
  } catch (error: unknown) {
    console.error("Error while retrive Patient info: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);

    const { id } = await params;
    const userId = Number(id);
    const body = await req.json();

    const services = getPatientrService();

    const isPatientUpdated = await services.updatePatientInfoById(userId, {
      patient: body.patient,
      notes: body.notes,
      medications: body.medications,
      imaging: body.imaging,
    });

    if (!isPatientUpdated) {
      return NextResponse.json(
        { success: false, message: "Failed to update user!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated successfully!" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error while Editing Patient info: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAuth(["ADMIN", "SUPERADMIN"]);

    const patientId = Number((await params).id);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID" },
        { status: 400 },
      );
    }

    const services = getPatientrService();
    const isPatientDeleted = await services.deletePatientDataById(patientId);

    if (!isPatientDeleted) {
      return NextResponse.json({
        success: false,
        message: "Failed to Delete Patient records!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Patient records deleted successfully!",
    });
  } catch (error: unknown) {
    console.error("Error while deleting Patient info: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
