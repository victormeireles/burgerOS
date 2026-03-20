import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Configure OPENAI_API_KEY no .env.local");
  }
  return new OpenAI({ apiKey });
}

export async function createChatCompletionWithFallback(args: {
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  response_format?: ChatCompletionCreateParamsNonStreaming["response_format"];
}) {
  const openai = getOpenAIClient();
  const preferredModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  try {
    return await openai.chat.completions.create({
      model: preferredModel,
      messages: args.messages,
      temperature: args.temperature ?? 0.2,
      response_format: args.response_format,
    });
  } catch (error) {
    const maybeMessage = error instanceof Error ? error.message : "";
    const shouldFallback = preferredModel !== "gpt-4.1-mini" && maybeMessage.toLowerCase().includes("model");
    if (!shouldFallback) throw error;

    return openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: args.messages,
      temperature: args.temperature ?? 0.2,
      response_format: args.response_format,
    });
  }
}
