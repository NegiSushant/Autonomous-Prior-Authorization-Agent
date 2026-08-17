import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const note = await prismaClient.medicationRecord.create({
      data: {
        patientId: body.patientId,
        documentId: body.documentId,
        drugName: body.drugName,
        category: body.category,
        recordDate: body.recordDate,
        status: body.status,
      },
    });
    return NextResponse.json({ success: true, data: note });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}