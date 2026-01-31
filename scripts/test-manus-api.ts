/**
 * Simple test script to verify Manus API connection
 * Makes a minimal request: "What's the color of the sky?"
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env file
config({ path: resolve(__dirname, "../.env") });

const BASE = "https://api.manus.im/v1/responses";
const POLL_MS = 2000; // Check every 2 seconds
const TIMEOUT_MS = 60_000; // 60 second timeout

function apiKey(): string {
  const k = process.env.MANUS_API_KEY ?? process.env.AI_OPENAI_COMPATIBLE_API_KEY;
  if (!k) throw new Error("MANUS_API_KEY or AI_OPENAI_COMPATIBLE_API_KEY required");
  return k;
}

async function manusFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers as object), API_KEY: apiKey() },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Manus API ${res.status}: ${errorText}`);
  }
  return res.json();
}

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

async function testManusAPI() {
  console.log("🧪 Testing Manus API connection...\n");
  console.log("📤 Sending simple test request: 'What's the color of the sky?'\n");

  try {
    // Create task
    const createResponse = (await manusFetch("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "What's the color of the sky?",
              },
            ],
          },
        ],
        task_mode: "agent",
        agent_profile: "manus-1.6-lite", // Use lite profile for cheaper/faster test
      }),
    })) as { id: string; status: string };

    const taskId = createResponse.id;
    console.log(`✅ Task created: ${taskId}`);
    console.log(`📊 Initial status: ${createResponse.status}\n`);

    // Poll for completion
    const deadline = Date.now() + TIMEOUT_MS;
    let attempts = 0;

    while (true) {
      attempts++;
      const response = (await manusFetch(`/${taskId}`)) as {
        status: string;
        output?: unknown[];
        error?: { message?: string };
      };

      const outputText = getOutputText(response.output);
      console.log(`[Attempt ${attempts}] Status: ${response.status}`);

      if (response.status !== "running" && response.status !== "pending") {
        console.log("\n" + "=".repeat(60));
        if (response.status === "completed") {
          console.log("✅ Task completed successfully!\n");
          console.log("📝 Response:");
          console.log(outputText || "(No text output found)");
        } else {
          console.log("❌ Task failed\n");
          console.log("Error:", response.error?.message || "Unknown error");
          if (outputText) {
            console.log("\nOutput:", outputText);
          }
        }
        console.log("=".repeat(60));
        return;
      }

      if (Date.now() >= deadline) {
        console.log("\n⏱️  Timeout reached");
        console.log("Last output:", outputText || "(none)");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testManusAPI();
