import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

export async function GET() {
  try {
    const repo = getPatientDataRepository();
    const patients = await repo.getFullPatientInfoAsync();
    console.log(patients);
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
  } catch (e) {
    console.error("Bulk create error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
