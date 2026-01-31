import getBody from "@/app/api/lib/getBody";
import {
  getAccommodationPrompt,
  getActivityPrompt,
} from "@/lib/prompts.manus.service";
import { createManusAgentTask } from "@/lib/manus-responses";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  destination: z.unknown(),
  preferences: z.string().min(1),
  preference_summary: z.string().min(1),
  plan_id: z.string().min(1),
  location_id: z.string().min(1),
});

async function handleLocationResearch(
  body: z.infer<typeof bodySchema>
): Promise<NextResponse> {
  const plan = await prisma.plan.findUnique({
    where: { id: body.plan_id },
  });
  if (!plan) {
    return NextResponse.json(
      { error: "The plan wasn't found." },
      { status: 404 }
    );
  }
  const location = await prisma.location.findFirst({
    where: { id: body.location_id, planId: plan.id },
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
    where: { id: body.location_id },
    data: { isSelected: true },
  });
  const accommodationPrompt = await getAccommodationPrompt(plan);
  const activityPrompt = await getActivityPrompt(plan);
  const prompt = [accommodationPrompt, "", activityPrompt].join("\n");
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
    return handleLocationResearch(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the location researcher." },
      { status: 500 }
    );
  }
}
