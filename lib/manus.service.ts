/**
 * Manus API service – request destination suggestions from user + plan data.
 * @see https://open.manus.im/docs/openai-compatibility
 */

import { buildDestinationPrompt } from "@/lib/manus-service-prompts";
import {
  type DestinationSuggestion,
  validateDestinationSuggestionsResponse,
} from "@/lib/manus-service-schemas";
import { prisma } from "@/prisma/prisma";

// Prisma delegates (user, plan) added at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegates at runtime
const db = prisma as any;

export type { DestinationSuggestion };

export interface RequestDestinationsResult {
  taskId: string;
  status: "completed" | "error" | "pending";
  destinations: DestinationSuggestion[];
  rawOutput?: string;
  error?: string;
}

const BASE = "https://api.manus.im/v1/responses";
const POLL_MS = 4000;
const TIMEOUT_MS = 120_000;

function apiKey(): string {
  const k = process.env.MANUS_API_KEY ?? process.env.AI_OPENAI_COMPATIBLE_API_KEY;
  if (!k) throw new Error("MANUS_API_KEY or AI_OPENAI_COMPATIBLE_API_KEY required");
  return k;
}

/** Shared fetch for Manus API (adds base URL and API_KEY header). */
async function manusFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers as object), API_KEY: apiKey() },
  });
  if (!res.ok) throw new Error(`Manus API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getUserForManus(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

export async function getPlanForManus(planId: string, userId?: string) {
  const plan = await db.plan.findUnique({
    where: { id: planId },
    include: { locations: true, accommodations: true, activities: true, transports: true },
  });
  if (!plan) throw new Error("Plan not found");
  if (userId != null && plan.userId !== userId) throw new Error("Plan does not belong to this user");
  return plan;
}

/** Extract last assistant output_text from Manus response output. */
function getOutputText(output: unknown[] | undefined): string {
  if (!Array.isArray(output)) return "";
  for (let i = output.length - 1; i >= 0; i--) {
    const item = output[i] as { role?: string; content?: { type?: string; text?: string }[] };
    if (item?.role !== "assistant" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text.trim();
    }
  }
  return "";
}

/** Parse and Zod-validate destination array from model output. */
function parseDestinations(raw: string): DestinationSuggestion[] {
  const match = raw.match(/\[[\s\S]*\]/);
  try {
    return validateDestinationSuggestionsResponse(JSON.parse(match ? match[0] : raw) as unknown);
  } catch {
    return [];
  }
}

function toResult(
  taskId: string,
  status: RequestDestinationsResult["status"],
  rawOutput: string,
  error?: string
): RequestDestinationsResult {
  return { taskId, status, destinations: parseDestinations(rawOutput), rawOutput: rawOutput || undefined, error };
}

export async function requestDestinationSuggestions(
  userId: string,
  planId: string
): Promise<RequestDestinationsResult> {
  const user = await getUserForManus(userId);
  const plan = await getPlanForManus(planId, userId);
  const data = (await manusFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: [{ role: "user", content: [{ type: "input_text", text: buildDestinationPrompt(user, plan) }] }],
      task_mode: "agent",
      agent_profile: "manus-1.6",
    }),
  })) as { id: string; status: string };
  const taskId = data.id;
  const deadline = Date.now() + TIMEOUT_MS;

  while (true) {
    const r = (await manusFetch(`/${taskId}`)) as { status: string; output?: unknown[]; error?: { message?: string } };
    const text = getOutputText(r.output);
    if (r.status !== "running" && r.status !== "pending")
      return toResult(taskId, r.status === "completed" ? "completed" : "error", text, r.error?.message);
    if (Date.now() >= deadline) return toResult(taskId, "pending", text, "Polling timeout");
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
