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

// Track which task IDs have been notified for completion/failure to avoid duplicates
const notifiedTasks = new Set<string>();

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
      interactive_mode: false,
      connectors: travelConnectors(),
    }),
  })) as ManusResponse;
}

/** Retrieves the current status and output for a task by id. */
export async function retrieveManusResponse(taskId: string): Promise<ManusResponse> {
  return (await manusFetch(`/${taskId}`)) as ManusResponse;
}

/**
 * Sends a push notification about agent task progress.
 * Wrapped in try-catch to prevent notification errors from breaking functionality.
 */
export async function notifyTaskProgress(
  status: "started" | "completed" | "failed",
  taskType: string,
  taskId?: string
): Promise<void> {
  try {
    // For completed/failed, check if we've already notified to avoid duplicates
    if (taskId && (status === "completed" || status === "failed")) {
      const notificationKey = `${taskId}:${status}`;
      if (notifiedTasks.has(notificationKey)) {
        return; // Already notified
      }
      notifiedTasks.add(notificationKey);
    }

    // Dynamically import to avoid circular dependencies
    const { sendNotification } = await import("@/app/actions");
    
    let message: string;
    switch (status) {
      case "started":
        message = `Your ${taskType} is being processed...`;
        break;
      case "completed":
        message = `Your ${taskType} is ready!`;
        break;
      case "failed":
        message = `There was an issue with your ${taskType}.`;
        break;
      default:
        message = `Update on your ${taskType}.`;
    }
    
    await sendNotification(message);
  } catch (error) {
    // Silently fail - notification errors should not break functionality
    console.error(`Failed to send ${status} notification for ${taskType}:`, error);
  }
}
