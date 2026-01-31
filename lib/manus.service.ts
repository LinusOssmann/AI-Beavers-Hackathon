/**
 * Manus API service – request destination suggestions using user + plan data.
 * Uses the Manus Responses API (OpenAI-compatible) with task_mode agent.
 * @see https://open.manus.im/docs/openai-compatibility
 */

import { buildDestinationPrompt } from "@/lib/manus-service-prompts";
import {
  type DestinationSuggestion,
  validateDestinationSuggestionsResponse,
} from "@/lib/manus-service-schemas";
import { prisma } from "@/prisma/prisma";

// Prisma client delegates (user, plan, etc.) are added at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type { DestinationSuggestion };

export interface RequestDestinationsResult {
  taskId: string;
  status: "completed" | "error" | "pending";
  destinations: DestinationSuggestion[];
  rawOutput?: string;
  error?: string;
}

const MANUS_BASE_URL = "https://api.manus.im";
const MANUS_RESPONSES_PATH = "/v1/responses";
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 120_000;

function getManusApiKey(): string {
  const key =
    process.env.MANUS_API_KEY ?? process.env.AI_OPENAI_COMPATIBLE_API_KEY;
  if (!key) {
    throw new Error(
      "MANUS_API_KEY or AI_OPENAI_COMPATIBLE_API_KEY must be set"
    );
  }
  return key;
}

/**
 * Fetches user by id. Throws if not found.
 */
export async function getUserForManus(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Fetches plan by id with related locations, accommodations, activities, transports.
 * Throws if not found. Validates plan belongs to the given user when userId is provided.
 */
export async function getPlanForManus(planId: string, userId?: string) {
  const plan = await db.plan.findUnique({
    where: { id: planId },
    include: {
      locations: true,
      accommodations: true,
      activities: true,
      transports: true,
    },
  });
  if (!plan) throw new Error("Plan not found");
  if (userId != null && plan.userId !== userId) {
    throw new Error("Plan does not belong to this user");
  }
  return plan;
}

/**
 * Creates a Responses API task on Manus and returns the initial response (id, status).
 */
async function createManusTask(prompt: string): Promise<{
  id: string;
  status: string;
}> {
  const apiKey = getManusApiKey();
  const url = `${MANUS_BASE_URL}${MANUS_RESPONSES_PATH}`;
  const body = {
    input: [
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
    ],
    task_mode: "agent",
    agent_profile: "manus-1.6",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      API_KEY: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Manus API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id: string; status: string };
  return { id: data.id, status: data.status };
}

/**
 * Retrieves the current task state from Manus.
 */
async function retrieveManusTask(taskId: string): Promise<{
  status: string;
  output?: Array<{
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
}> {
  const apiKey = getManusApiKey();
  const url = `${MANUS_BASE_URL}${MANUS_RESPONSES_PATH}/${taskId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { API_KEY: apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Manus API retrieve error ${res.status}: ${text}`);
  }

  return (await res.json()) as {
    status: string;
    output?: Array<{
      role?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
    error?: { message?: string };
  };
}

/**
 * Extracts plain text from Manus response output (last assistant message).
 */
function extractOutputText(
  output: Array<{
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>
): string {
  if (!Array.isArray(output)) return "";
  for (let i = output.length - 1; i >= 0; i--) {
    const item = output[i];
    if (item?.role !== "assistant" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        return part.text.trim();
      }
    }
  }
  return "";
}

/**
 * Parses the agent's reply and validates with Zod.
 * Expects a JSON array; returns only items that pass validation (0–3).
 */
function parseDestinationsFromOutput(
  rawOutput: string
): DestinationSuggestion[] {
  const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
  const jsonStr = jsonMatch ? jsonMatch[0] : rawOutput;
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    return validateDestinationSuggestionsResponse(parsed);
  } catch {
    return [];
  }
}

/**
 * Requests three destination suggestions from the Manus API using data from the
 * given user and plan. Fetches user and plan from the database, builds a prompt,
 * creates a Manus task, polls until completion (or timeout/error), and returns
 * parsed destinations.
 *
 * @param userId - User id (used to fetch user and validate plan ownership)
 * @param planId - Plan id (fetched with locations, accommodations, activities, transports)
 */
export async function requestDestinationSuggestions(
  userId: string,
  planId: string
): Promise<RequestDestinationsResult> {
  const user = await getUserForManus(userId);
  const plan = await getPlanForManus(planId, userId);
  const prompt = buildDestinationPrompt(user, plan);

  const { id: taskId, status: initialStatus } = await createManusTask(prompt);

  if (initialStatus !== "running" && initialStatus !== "pending") {
    const retrieved = await retrieveManusTask(taskId);
    const rawOutput = extractOutputText(retrieved.output ?? []);
    return {
      taskId,
      status: initialStatus === "completed" ? "completed" : "error",
      destinations: parseDestinationsFromOutput(rawOutput),
      rawOutput: rawOutput || undefined,
      error: retrieved.error?.message,
    };
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let lastStatus = initialStatus;
  let lastOutput: string | undefined;
  let lastError: string | undefined;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const retrieved = await retrieveManusTask(taskId);
    lastStatus = retrieved.status;
    lastOutput = extractOutputText(retrieved.output ?? []);
    lastError = retrieved.error?.message;

    if (retrieved.status === "completed") {
      return {
        taskId,
        status: "completed",
        destinations: parseDestinationsFromOutput(lastOutput),
        rawOutput: lastOutput || undefined,
      };
    }
    if (retrieved.status === "error") {
      return {
        taskId,
        status: "error",
        destinations: [],
        rawOutput: lastOutput || undefined,
        error: lastError,
      };
    }
  }

  return {
    taskId,
    status: "pending",
    destinations: parseDestinationsFromOutput(lastOutput ?? ""),
    rawOutput: lastOutput,
    error: "Polling timeout",
  };
}
