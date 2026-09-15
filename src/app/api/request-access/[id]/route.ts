import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  // 1. Type params as a Promise in Next.js 15
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 2. Await the params before accessing .id
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid request ID provided." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status provided." },
        { status: 400 },
      );
    }

    if (status === "REJECTED" && (!adminNotes || adminNotes.trim() === "")) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin notes are required to reject a request.",
        },
        { status: 400 },
      );
    }

    const updatedRequest = await prisma.accessRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error(`[ACCESS_REQUEST_PATCH] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
