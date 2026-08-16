// scripts/ingest-policy-kb.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import prismaClient from "../src/lib/prisma";

export const openai = new AzureOpenAIEmbeddings({
  azureOpenAIEndpoint: process.env.OPENAI_ENDPOINT,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiKey: process.env.OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPENAI_DEPLOYEMENTNAME,
  verbose: true,
});

const KB_DIR = path.join(process.cwd(), "src/lib/policy-kb");

const SOURCES = [
  {
    file: "bluecross_lumbar_mri.txt",
    insurance: "BlueCross",
    procedure: "Lumbar MRI",
    cptCodes: "72148,72149,72158",
    aliases: "mri lumbar spine outpatient",
  },
  {
    file: "medicare_knee_arthroplasty.txt",
    insurance: "Medicare",
    procedure: "Total Knee Arthroplasty",
    cptCodes: "27447",
    aliases: "knee replacement tka",
  },
  {
    file: "aetna_knee_replacement.txt",
    insurance: "Aetna",
    procedure: "Total Knee Replacement",
    cptCodes: "27447",
    aliases: "knee arthroplasty",
  },
];

function chunkText(text: string, maxChars = 900): string[] {
  const parts = text.split(
    /\n(?=\d+\.|ALL requests|MEDICAL NECESSITY|Coverage|CRITERIA)/i,
  );
  const chunks: string[] = [];

  for (const part of parts) {
    const cleaned = part.trim();
    if (cleaned.length < 40) continue;

    if (cleaned.length <= maxChars) {
      chunks.push(cleaned);
    } else {
      for (let i = 0; i < cleaned.length; i += maxChars) {
        chunks.push(cleaned.slice(i, i + maxChars));
      }
    }
  }
  return chunks;
}

async function embed(text: string): Promise<number[]> {
  //   const res = await openai.embeddings.create({
  //     model: "text-embedding-3-small", // 1536 dims
  //     input: text,
  //   });
  const res = await openai.embedQuery(text);
  //   return res.data[0].embedding;
  return res;
}

async function main() {
  //   if (!process.env.OPENAI_API_KEY) {
  //     throw new Error("OPENAI_API_KEY is missing in .env");
  //   }

  // Optional: clear old chunks so re-ingest is clean
  await prismaClient.$executeRawUnsafe(`DELETE FROM policy_chunks`);

  let total = 0;

  for (const src of SOURCES) {
    const fullPath = path.join(KB_DIR, src.file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Skip missing file: ${src.file}`);
      continue;
    }

    const raw = fs.readFileSync(fullPath, "utf8");
    const chunks = chunkText(raw);
    console.log(`${src.file} → ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const embedding = await embed(content);
      const vectorLiteral = `[${embedding.join(",")}]`;

      await prismaClient.$executeRawUnsafe(
        `
        INSERT INTO policy_chunks
          (content, insurance, procedure, cpt_codes, source_file, metadata, embedding)
        VALUES
          ($1, $2, $3, $4, $5, $6::jsonb, $7::vector)
        `,
        content,
        src.insurance,
        src.procedure,
        src.cptCodes,
        src.file,
        JSON.stringify({ aliases: src.aliases, chunk_index: i }),
        vectorLiteral,
      );
      total++;
    }
  }

  console.log(`Ingested ${total} chunks into policy_chunks`);
}

main()
  .catch(console.error)
  .finally(() => prismaClient.$disconnect());
