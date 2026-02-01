import getBody from "@/app/api/lib/getBody";
import {
  createManusAgentTask,
  notifyTaskProgress,
} from "@/lib/manus-responses";
import { getLocationPrompt } from "@/lib/prompts.manus.service";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
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

  // Check if generation is already in progress
  if (plan.generationStatus === "generating_locations") {
    return NextResponse.json(
      { error: "Location generation already in progress" },
      { status: 409 }
    );
  }

  const prompt = await getLocationPrompt(plan);
  const response = await createManusAgentTask(prompt);

  // Update plan with generation status and task ID
  await prisma.plan.update({
    where: { id: body.planId },
    data: {
      generationStatus: "generating_locations",
      locationTaskId: response.id,
      lastGeneratedAt: new Date(),
    },
  });

  // Notify user that task has started (non-blocking)
  notifyTaskProgress("started", "location suggestions");

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
