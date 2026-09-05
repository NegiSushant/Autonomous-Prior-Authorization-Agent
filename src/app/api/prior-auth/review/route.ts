import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { PriorAuthReviewPayload } from "@/types/priorAuthResponse.dto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PriorAuthReviewPayload;

    if (!body.agentResult?.patientId || !body.decision) {
      return NextResponse.json(
        { success: false, message: "agentResult and decision are required." },
        { status: 400 },
      );
    }

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

    const review = await prismaClient.priorAuthReview.create({
      data: {
        patientId: Number(body.agentResult.patientId),
        agentRecommendation: body.agentResult.recommendation,
        agentStatus: body.agentResult.status,
        finalDecision: body.decision,
        reviewerNote: body.reviewerNote ?? null,
        agentResultJson: body.agentResult as unknown as Prisma.InputJsonValue,
        overridesJson: (body.overrides ??
          []) as unknown as Prisma.InputJsonValue,
        // reviewerId: session?.user?.id  // for later when you have auth session
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.id,
        finalDecision: review.finalDecision,
        createdAt: review.createdAt,
      },
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = Number(searchParams.get("patientId"));

    const reviews = await prismaClient.priorAuthReview.findMany({
      where: patientId ? { patientId } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        patientId: true,
        agentRecommendation: true,
        agentStatus: true,
        finalDecision: true,
        reviewerNote: true,
        overridesJson: true,
        createdAt: true,
        // optionally include agentResultJson for full detail later
      },
    });

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
