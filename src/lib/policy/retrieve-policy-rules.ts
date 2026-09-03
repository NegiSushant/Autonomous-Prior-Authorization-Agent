import { AzureOpenAIEmbeddings } from "@langchain/openai";
import prismaClient from "../prisma";

export const openai = new AzureOpenAIEmbeddings({
  azureOpenAIEndpoint: process.env.OPENAI_ENDPOINT,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiKey: process.env.OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPENAI_EMBEDDING_DEPLOYEMENTNAME,
  azureOpenAIApiInstanceName: process.env.OPENAI_INSTANCE_NAME,
  verbose: true,
});

export interface PolicyRetrievalResult {
  insurance: string;
  procedure: string;
  cpt_code?: string;
  rules: string[];
  sourceFiles: string[];
}

export async function embedQuery(text: string): Promise<number[]> {
  const res = await openai.embedQuery(text);
  return res;
}

export function toBullets(text: string, max = 4): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 25 &&
        /conservative|therapy|weeks|x-ray|imaging|mri|neurolog|failure|documented|physical|nsaid|chiropractic/i.test(
          l,
        ),
    );

  const bullets: string[] = [];
  for (const line of lines) {
    if (bullets.length >= max) break;
    const b = line.startsWith("•") || line.startsWith("-") ? line : `• ${line}`;
    if (!bullets.some((x) => x.includes(line.slice(0, 40)))) {
      bullets.push(b.slice(0, 280));
    }
  }

  if (bullets.length === 0 && text.trim()) {
    bullets.push(`• ${text.trim().slice(0, 220)}…`);
  }
  return bullets.slice(0, max);
}

export async function retrievePolicyRules(params: {
  procedure: string;
  insurance: string;
  cpt_code?: string;
  maxBullets?: number;
}): Promise<PolicyRetrievalResult> {
  const { procedure, insurance, cpt_code, maxBullets = 4 } = params;

  const queryText = [
    `prior authorization medical necessity criteria for ${procedure}`,
    `insurance ${insurance}`,
    cpt_code ? `CPT ${cpt_code}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const queryEmbedding = await embedQuery(queryText);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // pgvector cosine distance: smaller = more similar
  // 1 - cosine_distance ≈ cosine similarity when using vector_cosine_ops
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
    SELECT content, insurance, procedure, source_file, (embedding <=> $1::vector) AS distance
    FROM policy_chunks ORDER BY embedding <=> $1::vector LIMIT 8`,
    vectorLiteral,
  );

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

  return {
    insurance,
    procedure,
    cpt_code,
    rules,
    sourceFiles: [...sources],
  };
}
