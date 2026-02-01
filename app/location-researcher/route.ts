import getBody from "@/app/api/lib/getBody";
import {
  createManusAgentTask,
  notifyTaskProgress,
} from "@/lib/manus-responses";
import {
  getAccommodationPrompt,
  getActivityPrompt,
} from "@/lib/prompts.manus.service";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  planId: z.string().min(1),
  locationId: z.string().min(1),
});

async function createLocationResearch(
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

  const location = await prisma.location.findFirst({
    where: { id: body.locationId, planId: plan.id },
  });

  if (!location) {
    return NextResponse.json(
      { error: "The location wasn't found for this plan." },
      { status: 404 }
    );
  }
  await prisma.location.updateMany({
    where: { planId: plan.id },
    data: { isSelected: false },
  });

  await prisma.location.update({
    where: { id: body.locationId },
    data: { isSelected: true },
  });

  const accommodationPrompt = await getAccommodationPrompt(plan);
  const activityPrompt = await getActivityPrompt(plan);
  const prompt = [accommodationPrompt, "", activityPrompt].join("\n");
  const response = await createManusAgentTask(prompt);

  // Notify user that location research has started (non-blocking)
  notifyTaskProgress("started", "destination research");

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

    return createLocationResearch(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the location researcher." },
      { status: 500 }
    );
  }
}
