import { IAgentRAGRepository } from "@/lib/interfaces/IRepository/IAgentRAGRepository";
import prismaClient from "@/lib/prisma";

export class AgentRAGRepository implements IAgentRAGRepository {
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
}
