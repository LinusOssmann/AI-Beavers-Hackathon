/**
 * Vercel AI SDK – OpenAI-compatible provider initialization
 *
 * Uses any OpenAI-compatible API (OpenAI, Azure, local LLMs, OpenRouter, etc.)
 * via AI_OPENAI_COMPATIBLE_BASE_URL and AI_OPENAI_COMPATIBLE_API_KEY.
 *
 * @see https://ai-sdk.dev/
 * @see https://ai-sdk.dev/providers/openai-compatible-providers
 */

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const baseURL = process.env.AI_OPENAI_COMPATIBLE_BASE_URL;
const apiKey = process.env.AI_OPENAI_COMPATIBLE_API_KEY;

/**
 * OpenAI-compatible provider instance.
 * Use with generateText, streamText, etc. from the "ai" package.
 *
 * @example
 * import { generateText } from "ai";
 * import { aiModel } from "@/lib/ai";
 *
 * const { text } = await generateText({
 *   model: aiModel("gpt-4o-mini"),
 *   prompt: "Hello, world!",
 * });
 */
export const aiProvider = createOpenAICompatible({
  name: "openai-compatible",
  baseURL: baseURL ?? undefined,
  apiKey: apiKey ?? undefined,
  includeUsage: true,
});

/**
 * Convenience: get a chat model by ID.
 * Use this when calling generateText, streamText, etc.
 */
export function aiModel(modelId: string) {
  return aiProvider(modelId);
}
