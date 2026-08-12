import "dotenv/config";
import { ChatOpenAI, AzureChatOpenAI, OpenAI } from "@langchain/openai";

export const llm = new AzureChatOpenAI({
  azureOpenAIEndpoint: process.env.OPENAI_ENDPOINT,
  azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
  azureOpenAIApiKey: process.env.OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPENAI_DEPLOYEMENTNAME,
});

// export const llm = new ChatOpenAI({
//   model: "gpt-4o",
//   apiKey: process.env.OPENAI_API_KEY,
//   configuration: {
//     baseURL: "https://models.github.ai/inference",
//   },
// });

// export const llm = new OpenAI({
//   model: "gpt-5",
//   apiKey: process.env.OPENAI_API_KEY,
// });
