import { NextRequest, NextResponse } from "next/server";
import { executePriorAuthorization } from "@/lib/services/prior-auth-service";
import { mapAgentResponse } from "@/lib/utils/map-agent-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId } = body;
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
    const state = await executePriorAuthorization(patientId);
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
