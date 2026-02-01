/**
 * Manus API client for creating and retrieving agent tasks.
 * The API calls the Manus responses endpoint with travel connectors.
 */
interface ManusResponseMetadata {
  task_url?: string;
  task_title?: string;
}

export interface ManusResponse {
  id: string;
  status: string;
  metadata?: ManusResponseMetadata;
  output?: unknown[];
  error?: { message?: string } | string;
}

const BASE = "https://api.manus.im/v1/responses";

function apiKey(): string {
  const key = process.env.MANUS_API_KEY ?? process.env.AI_OPENAI_COMPATIBLE_API_KEY;
  if (!key) throw new Error("MANUS_API_KEY or AI_OPENAI_COMPATIBLE_API_KEY required");
  return key;
}

const DEFAULT_TRAVEL_CONNECTOR_ID = "44ec27f4-6ee5-430f-ba75-3d80c67af8bd";

function travelConnectors(): string[] {
  const value = process.env.MANUS_TRAVEL_CONNECTOR_ID || DEFAULT_TRAVEL_CONNECTOR_ID;
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Fetches the Manus API with the API key in headers. */
async function manusFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      API_KEY: apiKey(),
    },
  });
  if (!res.ok) throw new Error(`Manus API ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Creates an agent task with the given prompt and travel connectors. */
export async function createManusAgentTask(prompt: string): Promise<ManusResponse> {
  return (await manusFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      task_mode: "agent",
      agent_profile: "manus-1.6",
      connectors: travelConnectors(),
    }),
  })) as ManusResponse;
}

/** Retrieves the current status and output for a task by id. */
export async function retrieveManusResponse(taskId: string): Promise<ManusResponse> {
  return (await manusFetch(`/${taskId}`)) as ManusResponse;
}
