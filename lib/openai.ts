import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Configure OPENAI_API_KEY no .env.local");
  }
  return new OpenAI({ apiKey });
}
