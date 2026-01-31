import getBody from "@/app/api/lib/getBody";
import { createManusAgentTask } from "@/lib/manus-responses";
import { getPreferenceRefinerPrompt as getPreferenceTaskPrompt } from "@/lib/prompts.manus.service";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  preferences: z.string().min(1),
});

async function createPreferenceTask(
  body: z.infer<typeof bodySchema>
): Promise<NextResponse> {
  const prompt = await getPreferenceTaskPrompt(body.preferences);
  const response = await createManusAgentTask(prompt);

  return NextResponse.json({
    responseId: response.id,
    status: response.status,
    metadata: response.metadata,
  });
}

export async function POST(request: Request) {
  try {
    const body = await getBody(request, bodySchema);
    if (body instanceof NextResponse) return body;

    return createPreferenceTask(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the preference refiner." },
      { status: 500 }
    );
  }
}
