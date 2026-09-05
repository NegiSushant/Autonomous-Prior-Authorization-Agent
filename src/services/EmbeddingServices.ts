import { getAgentRAGRepository } from "@/di/reposetriesDiI";
import { embedingModel } from "@/lib/agents/embedingModel";
import { IAgentRAGRepository } from "@/lib/interfaces/IRepository/IAgentRAGRepository";
import { IEmbeddingServices } from "@/lib/interfaces/IServices/IEmbeddingServices";
import { toBullets } from "@/lib/utils/embedingfilters";
import { PolicyRetrievalResult } from "@/types/tools.dto";

export class EmbeddingServices implements IEmbeddingServices {
  private repository: IAgentRAGRepository;

  constructor() {
    this.repository = getAgentRAGRepository();
  }

  async retrievePolicyRules(
    procedure: string,
    insurance: string,
    cpt_code?: string,
    maxBullets?: number,
  ): Promise<PolicyRetrievalResult | null> {
    try {
      maxBullets = maxBullets ? maxBullets : 5;
      const queryText = [
        `prior authorization medical necessity criteria for ${procedure}`,
        `insurance ${insurance}`,
        cpt_code ? `CPT ${cpt_code}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const queryEmbedding = await this.embedQuery(queryText);

      // 1 - cosine_distance ≈ cosine similarity when using vector_cosine_ops
      const rows = await this.repository.fetchSimilarPolicyChunks(
        queryEmbedding,
        8,
      );
      //   const rows = await prismaClient.$queryRawUnsafe<
      //     Array<{
      //       content: string;
      //       insurance: string | null;
      //       procedure: string | null;
      //       source_file: string | null;
      //       distance: number;
      //     }>
      //   >(
      //     `
      //     SELECT content, insurance, procedure, source_file, (embedding <=> $1::vector) AS distance
      //     FROM policy_chunks ORDER BY embedding <=> $1::vector LIMIT 8`,
      //     vectorLiteral,
      //   );

      // Light metadata boost
      const scored = rows.map((r) => {
        let score = 1 - Number(r.distance);
        if (r.insurance?.toLowerCase().includes(insurance.toLowerCase()))
          score += 0.25;
        if (cpt_code && r.content.includes(cpt_code)) score += 0.2;
        if (
          r.procedure
            ?.toLowerCase()
            .includes(procedure.toLowerCase().split(" ")[0] ?? "")
        ) {
          score += 0.15;
        }
        return { ...r, score };
      });

      scored.sort((a, b) => b.score - a.score);

      const rules: string[] = [];
      const sources = new Set<string>();

      for (const row of scored) {
        if (rules.length >= maxBullets) break;
        const bullets = toBullets(row.content, maxBullets - rules.length);
        for (const b of bullets) {
          if (rules.length >= maxBullets) break;
          if (!rules.some((r) => r.includes(b.slice(0, 40)))) {
            rules.push(b);
            if (row.source_file) sources.add(row.source_file);
          }
        }
      }
      console.log(`data retrival function excuted!`);
      return {
        insurance,
        procedure,
        cpt_code,
        rules,
        sourceFiles: [...sources],
      };
    } catch (error) {
      console.error(`Error in the retrival function excuttions: ${error}`);
      return null;
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    const res = await embedingModel.embedQuery(text);
    return res;
  }
}
