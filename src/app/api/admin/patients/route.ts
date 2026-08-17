import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  try {
    // await requireAdmin();
    const patients = await prismaClient.patient.findMany({
      orderBy: { id: "asc" },
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
    const patient = await prismaClient.patient.create({
      data: {
        id: body.patientId,
        name: body.name,
        insurancePayer: body.insurancePayer,
        procedureCode: body.procedureCode,
        procedureName: body.procedureName,
        diagnosisCode: body.diagnosisCode,
      },
    });
    return NextResponse.json({ success: true, data: patient });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
