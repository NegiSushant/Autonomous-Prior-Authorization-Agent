import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getPatientrService } from "@/di/servicesDil";

export async function GET() {
  try {
    const user = await requireAuth(["ADMIN", "REVIEWER", "SUPERADMIN"]);

    const services = getPatientrService();
    const patients = await services.PatientInfoList(user);

    return NextResponse.json({ success: true, data: patients });
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

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);
    const body = await req.json();

    const services = getPatientrService();

    const success = await services.createPatientInfo({
      patient: body.patient,
      notes: body.notes,
      medications: body.medications,
      imaging: body.imaging,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to create patient!" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Patient created successfully!",
    });
  } catch (error: unknown) {
    console.error("Error while Creating Patient info: ", error);

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
