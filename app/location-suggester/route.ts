import getBody from "@/app/api/lib/getBody";
import { createManusAgentTask } from "@/lib/manus-responses";
import { getLocationPrompt } from "@/lib/prompts.manus.service";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  preferences: z.string().min(1),
  preferenceSummary: z.string().min(1),
  planId: z.string().min(1),
});

async function createLocationSuggestions(
  body: z.infer<typeof bodySchema>
): Promise<NextResponse> {
  const plan = await prisma.plan.findUnique({
    where: { id: body.planId },
  });

  if (!plan) {
    return NextResponse.json(
      { error: "The plan wasn't found." },
      { status: 404 }
    );
  }

  const prompt = await getLocationPrompt(plan);
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

    return createLocationSuggestions(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the location suggester." },
      { status: 500 }
    );
  }
}
