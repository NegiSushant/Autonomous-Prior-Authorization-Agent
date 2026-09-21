import { NextResponse } from "next/server";
import { getAccessRequestServices } from "@/di/servicesDil";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(
  request: Request,
  // 1. Type params as a Promise in Next.js 15
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await requireAuth(["SUPERADMIN"]);
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

    const service = getAccessRequestServices();
    const isRequestCompleted = await service.actionOnAccessRequest(
      status,
      adminNotes,
      id,
      sessionUser,
    );

    if (!isRequestCompleted) {
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Request Created Successfully!",
    });
  } catch (error) {
    console.error(`[ACCESS_REQUEST_PATCH] Error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
