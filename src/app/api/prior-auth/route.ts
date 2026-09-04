import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getPriorAuthService } from "@/di/servicesDil";

export async function POST(req: NextRequest) {
  try {
    const userSession = await requireAuth(["ADMIN", "SUPERADMIN", "REVIEWER"]);
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
    const services = getPriorAuthService();
    // const result = await executePriorAuthorization(patientId);
    const state = await services.executePriorAuthorization(
      patientId,
      userSession,
    );
    // const state = await executePriorAuthorization(String(patientId));
    console.log(`Agent state: ${state}`);
    if (state === null) {
      return NextResponse.json({
        success: false,
        message: "Agent response state null!",
      });
    }
    const response = await services.mapAgentResponse(state);
    console.log(`
Agent response after mapping:

Criteria:
${JSON.stringify(response?.criteria, null, 2)}

Execution Traces:
${JSON.stringify(response?.executionTrace, null, 2)}

Gathered Evidence:
${JSON.stringify(response?.gatheredEvidence, null, 2)}

Recommendations:
${JSON.stringify(response?.recommendation, null, 2)}

Status:
${response?.status}
`);
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
