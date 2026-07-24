import { ChatOpenAI } from "@langchain/openai";

console.log(process.env.OPENAI_API_KEY);

export const llm = new ChatOpenAI({
  model: "gpt-5",
  apiKey: process.env.OPENAI_API_KEY,
});
