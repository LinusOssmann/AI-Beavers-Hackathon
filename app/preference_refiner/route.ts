import { z } from "zod";
import { createManusAgentTask } from "@/lib/manus-responses";

const requestSchema = z.object({
  preferences: z.string().min(1),
});

function buildPreferenceRefinerPrompt(preferences: string): string {
  return [
    "You should research the preferences of the user based on the following input:",
    "",
    preferences,
    "",
    'Please research in a shallow research the things the user has expressed interests in. Only research things that benefit from research, e.g. activities or locations you don\'t know much about. If the user expressed "liking the outdoors", this is highly unspecific and does not need further research.',
    "",
    "DO NOT create files. Simply respond in natural language with your final summary/assessment.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const prompt = buildPreferenceRefinerPrompt(payload.preferences);
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
