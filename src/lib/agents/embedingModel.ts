import "dotenv/config";
import { AzureOpenAIEmbeddings } from "@langchain/openai";

export const embedingModel = new AzureOpenAIEmbeddings({
  azureOpenAIEndpoint: process.env.OPENAI_ENDPOINT,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiKey: process.env.OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPENAI_EMBEDDING_DEPLOYEMENTNAME,
  azureOpenAIApiInstanceName: process.env.OPENAI_INSTANCE_NAME,
  verbose: true,
});

export async function embedQuery(text: string): Promise<number[]> {
  const res = await embedingModel.embedQuery(text);
  return res;
}
