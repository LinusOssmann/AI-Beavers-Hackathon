import { z } from "zod";
import { createManusAgentTask } from "@/lib/manus-responses";

const requestSchema = z.object({
  preferences: z.string().min(1),
  preference_summary: z.string().min(1),
  plan_id: z.string().min(1),
});

function buildLocationSuggesterPrompt(
  preferences: string,
  preferenceSummary: string,
  planId: string
): string {
  return [
    "You are supposed to suggest 10 travel locations for a user. The user has already expressed these interests:",
    "",
    preferences,
    "",
    "You have already made the following assessment about the user:",
    "",
    preferenceSummary,
    "",
    "Do a shallow research and suggest 8 - 16 travel destinations (preferably specific cities, use broader locations or areas only if a single city would be too small for a trip of their desired duration). You should add those with the 'add_destination' tool.",
    "",
    `The plan_id to use is ${planId}`,
    "",
    "DO NOT create files. It does not matter what you respond in the end as long as you called the tool an appropriate number of times.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const prompt = buildLocationSuggesterPrompt(
      payload.preferences,
      payload.preference_summary,
      payload.plan_id
    );
    const response = await createManusAgentTask(prompt);
    return Response.json({
      response_id: response.id,
      status: response.status,
      metadata: response.metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
