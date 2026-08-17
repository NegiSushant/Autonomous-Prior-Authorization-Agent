import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const note = await prismaClient.imagingReport.create({
      data: {
        patientId: body.patientId,
        documentId: body.documentId,
        bodyPart: body.bodyPart,
        findings: body.findings,
        reportDate: body.reportDate,
        sourceType: body.sourceType,
      },
    });
    return NextResponse.json({ success: true, data: note });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
