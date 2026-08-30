import { NextRequest, NextResponse } from "next/server";
import { executePriorAuthorization } from "@/services/prior-auth-service";
import { mapAgentResponse } from "@/lib/utils/map-agent-response";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  try {
    // const userSession = await requireAuth(["ADMIN", "SUPERADMIN", "REVIEWER"]);
    const body = await req.json();
    const { patientId } = body;

    // const patientId = Number(id);

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "patientId is required.",
        },
        {
          status: 400,
        },
      );
    }

    // const result = await executePriorAuthorization(patientId);
    // const state = await executePriorAuthorization(patientId, userSession);
    const state = await executePriorAuthorization(String(patientId));
    console.log(`Agent state: ${state}`)
    const response = mapAgentResponse(state);
    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      {
        status: 500,
      },
    );
  }
}
