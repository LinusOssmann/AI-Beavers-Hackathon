/**
 * AI provider for OpenAI-compatible APIs (e.g. Manus).
 * The module exposes a provider and model for use in AI SDK calls.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const baseURL = process.env.AI_OPENAI_COMPATIBLE_BASE_URL;
const apiKey = process.env.AI_OPENAI_COMPATIBLE_API_KEY;

export const aiProvider = createOpenAICompatible({
  name: "manus",
  baseURL: baseURL || "",
  apiKey: apiKey || "",
  includeUsage: true,
});

/** Returns the provider configured for the given model id. */
export function aiModel(modelId: string) {
  return aiProvider(modelId);
}

export const manusModel = aiModel("manus-1.6");
