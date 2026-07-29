import "dotenv/config";
import { ChatOpenAI, OpenAI } from "@langchain/openai";

console.log(process.env.OPENAI_API_KEY);

export const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: "https://models.github.ai/inference",
  },
});

// export const llm = new OpenAI({
//   model: "gpt-5",
//   apiKey: process.env.OPENAI_API_KEY,
// });
