import { getOrganizationsService, getPriorAuthService } from "@/di/servicesDil";
import { requireAuth } from "@/lib/requireAuth";
import { PriorAuthReviewPayload } from "@/types/priorAuthResponse.dto";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ patientId: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { patientId } = await params;
    console.log(`Search Params: ${patientId}`);
    const pId = Number(patientId);
    console.log(`Patient iD: ${pId}`);

    const services = getPriorAuthService();
    const reviews = await services.retriveAgentResponse(pId);
    console.log(`Agent saved response: ${reviews}`);
    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("[prior-auth/review GET]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch reviews.",
      },
      { status: 500 },
    );
  }
}

export async function POST(_req: Request, { params }: Params) {
  try {
    const sessionUser = await requireAuth(["SUPERADMIN", "ADMIN", "REVIEWER"]);
    
    const { patientId } = await params;

    const pId = Number(patientId);
    const body = (await _req.json()) as PriorAuthReviewPayload;
    // const patientId = body.patientId;

    //1. if user role === superadmin then allow overide the agent reponse
    //2. Admin and user only overide there perspective patient data.
    if (sessionUser.role === "ADMIN" || sessionUser.role === "REVIEWER") {
      const orgServies = getOrganizationsService();
      // based on the organization id varify the patient i.e. patient and user should belongs the same orgs
      const isOrgsMeet = await orgServies.ensureSameOrganization(
        sessionUser.id,
        pId,
      );

      if (!isOrgsMeet) {
        return NextResponse.json(
          {
            success: false,
            message: "Not authorize to override the response!",
          },
          { status: 404 },
        );
      }
    }

    if (!body.patientId || !body.decision) {
      return NextResponse.json(
        { success: false, message: "agentResult and decision are required." },
        { status: 400 },
      );
    }

    const services = getPriorAuthService();
    // Basic validation of overrides
    for (const o of body.overrides ?? []) {
      if (!o.criteriaId || !o.justification?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Each override must include criteriaId and justification.",
          },
          { status: 400 },
        );
      }
    }

    const isOverride = await services.storeOverrideResponse(
      body,
      sessionUser.id,
    );

    if (!isOverride) {
      return NextResponse.json(
        {
          success: true,
          message: "Error occure while override data!",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data override successfully!",
    });
  } catch (error) {
    console.error("[prior-auth/review]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save review.",
      },
      { status: 500 },
    );
  }
}
