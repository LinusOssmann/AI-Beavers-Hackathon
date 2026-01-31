import getBody from "@/app/api/lib/getBody";
import { createManusAgentTask } from "@/lib/manus-responses";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  preferences: z.string().min(1),
});

const PREFERENCE_REFINER_PROMPT_PREFIX =
  "You should research the preferences of the user based on the following input:";
const PREFERENCE_REFINER_PROMPT_SUFFIX = [
  "",
  'Please research in a shallow research the things the user has expressed interests in. Only research things that benefit from research, e.g. activities or locations you don\'t know much about. If the user expressed "liking the outdoors", this is highly unspecific and does not need further research.',
  "",
  "DO NOT create files. Simply respond in natural language with your final summary/assessment.",
].join("\n");

async function handlePreferenceRefine(
  body: z.infer<typeof bodySchema>
): Promise<NextResponse> {
  const prompt = [
    PREFERENCE_REFINER_PROMPT_PREFIX,
    "",
    body.preferences,
    PREFERENCE_REFINER_PROMPT_SUFFIX,
  ].join("\n");
  const response = await createManusAgentTask(prompt);
  return NextResponse.json({
    response_id: response.id,
    status: response.status,
    metadata: response.metadata,
  });
}

export async function POST(request: Request) {
  try {
    const body = await getBody(request, bodySchema);
    if (body instanceof NextResponse) return body;
    return handlePreferenceRefine(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the preference refiner." },
      { status: 500 }
    );
  }
}
