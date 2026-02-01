import getBody from "@/app/api/lib/getBody";
import {
  retrieveManusResponse,
  notifyTaskProgress,
} from "@/lib/manus-responses";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  responseId: z.string().min(1).optional(),
  taskId: z.string().min(1).optional(),
});

function getResponseIdentifierFromURL(url: string): string | null {
  const params = new URL(url).searchParams;

  return params.get("responseId") ?? params.get("taskId");
}

function getResponseIdentifierFromBody(
  body: z.infer<typeof bodySchema>
): string | null {
  return body.responseId ?? body.taskId ?? null;
}

async function handleCheckStatus(responseId: string) {
  const data = await retrieveManusResponse(responseId);

  // Send notification on completion or failure (non-blocking)
  if (data.status === "completed") {
    notifyTaskProgress("completed", "task", responseId);
  } else if (data.status === "failed") {
    notifyTaskProgress("failed", "task", responseId);
  }

  return NextResponse.json(data);
}

export async function GET(request: Request) {
  try {
    const responseId = getResponseIdentifierFromURL(request.url);
    if (!responseId) {
      return NextResponse.json(
        { error: "The 'responseId' is missing." },
        { status: 400 }
      );
    }
    return handleCheckStatus(responseId);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error checking the status." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await getBody(request, bodySchema);
    if (body instanceof NextResponse) return body;

    const responseId = getResponseIdentifierFromBody(body);
    if (!responseId) {
      return NextResponse.json(
        { error: "The 'responseId' is missing." },
        { status: 400 }
      );
    }
    return handleCheckStatus(responseId);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error checking the status." },
      { status: 500 }
    );
  }
}
