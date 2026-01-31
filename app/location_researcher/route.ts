import { z } from "zod";
import { createManusAgentTask } from "@/lib/manus-responses";

const requestSchema = z.object({
  destination: z.unknown(),
  preferences: z.string().min(1),
  preference_summary: z.string().min(1),
  plan_id: z.string().min(1),
  location_id: z.string().min(1),
});

function formatDestination(destination: unknown): string {
  if (typeof destination === "string") return destination;
  try {
    return JSON.stringify(destination, null, 2);
  } catch {
    return String(destination);
  }
}

function buildLocationResearcherPrompt(
  destination: string,
  preferences: string,
  preferenceSummary: string,
  locationId: string
): string {
  return [
    "You are doing a heavy, in depth research to find accomodation options and activity ideas for a user which wants to travel to the following destioation:",
    "",
    destination,
    "",
    "The user has expressed those general preferences:",
    "",
    preferences,
    "",
    "You have already made the following assumptions about the user:",
    "",
    preferenceSummary,
    "",
    "You should suggest at least 15 accomodation options and 40 activity options in the destination which match the interests of the user very well. You may suggest more if appropriate, but always suggest less than 30 accomodation options and 80 activities.",
    "",
    "More details:",
    "- accomodation options may be hotels or hostels",
    "- activities may be guided tours, museums, sights, cafes, galleries, specific (!) sports events, districts in a city, restaurants, street food, specific (!) cultural events, etc.",
    '- in both cases try to match the suggested things to what you believe the user would want to do while in the city. Keep a balance between "must not miss" activities and curated, highly tailored nieche recommendations. Similar to lonely planet.',
    "- try to add a URL to each candidate; this URL will be shown to the user so they can research the thing in more detail; these links may be hotel websites, eventim pages, wikipedia pages, etc., but they should allow the user to make an educated decision about whether or not they want to do that activity; for restaurants and cafes always prefer google maps links.",
    "",
    "DO NOT create any files. It does not matter what you respond in the end as long as you called the tools enough times with the appropriate inputs.",
    "",
    `The location_id to use for MCP tool calls is ${locationId}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const prompt = buildLocationResearcherPrompt(
      formatDestination(payload.destination),
      payload.preferences,
      payload.preference_summary,
      payload.plan_id,
      payload.location_id
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
