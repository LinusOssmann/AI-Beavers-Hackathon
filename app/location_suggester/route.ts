import getBody from "@/app/api/lib/getBody";
import { getLocationPrompt } from "@/lib/prompts.manus.service";
import { createManusAgentTask } from "@/lib/manus-responses";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  preferences: z.string().min(1),
  preference_summary: z.string().min(1),
  plan_id: z.string().min(1),
});

async function handleLocationSuggest(
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
  const prompt = await getLocationPrompt(plan);
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
    return handleLocationSuggest(body);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error running the location suggester." },
      { status: 500 }
    );
  }
}
