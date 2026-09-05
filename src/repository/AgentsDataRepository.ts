import { Prisma } from "@/generated/prisma/client";
import { IAgentsDataRepository } from "@/lib/interfaces/IRepository/IAgentsDataRepository";
import prismaClient from "@/lib/prisma";
import { PriorAuthResponse } from "@/types/agentState.dto";

export class AgentsDataRepository implements IAgentsDataRepository {
  async fetchSimilarPolicyChunks(
    embedding: number[],
    limit: number = 8,
  ): Promise<
    Array<{
      content: string;
      insurance: string | null;
      procedure: string | null;
      source_file: string | null;
      distance: number;
    }>
  > {
    const vectorLiteral = `[${embedding.join(",")}]`;

    const rows = await prismaClient.$queryRawUnsafe<
      Array<{
        content: string;
        insurance: string | null;
        procedure: string | null;
        source_file: string | null;
        distance: number;
      }>
    >(
      `
    SELECT 
      content, 
      insurance, 
      procedure, 
      source_file, 
      (embedding <=> $1::vector) AS distance
    FROM policy_chunks 
    ORDER BY embedding <=> $1::vector 
    LIMIT $2
    `,
      vectorLiteral,
      limit,
    );

    return rows;
  }

  async storeAgentResponse(state: PriorAuthResponse): Promise<boolean> {
    try {
      // await prismaClient.priorAuthReview.create({
      //   data: {
      //     patientId: state.patientId,
      //     agentRecommendation: state.recommendation,
      //     agentStatus: state.status,
      //     criteria: state.criteria as unknown as Prisma.InputJsonValue,
      //     executionTrace:
      //       state.executionTrace as unknown as Prisma.InputJsonValue,
      //     gatheredEvidence:
      //       state.gatheredEvidence as unknown as Prisma.InputJsonValue,
      //     agentResultJson: state as unknown as Prisma.InputJsonValue,
      //   },
      // });
      await prismaClient.patient.update({
        where: { id: state.patientId },
        data: {
          isProceed: true,
          reviews: {
            create: {
              agentRecommendation: state.recommendation,
              agentStatus: state.status,
              criteria: state.criteria as unknown as Prisma.InputJsonValue,
              executionTrace:
                state.executionTrace as unknown as Prisma.InputJsonValue,
              gatheredEvidence:
                state.gatheredEvidence as unknown as Prisma.InputJsonValue,
              agentResultJson: state as unknown as Prisma.InputJsonValue,
            },
          },
        },
      });
      return true;
    } catch (error) {
      console.error(`Error while storing agent reponse in DB: ${error}`);
      return false;
    }
  }
}
