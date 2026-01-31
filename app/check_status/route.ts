import { z } from "zod";
import { retrieveManusResponse } from "@/lib/manus-responses";

const requestSchema = z.object({
  response_id: z.string().min(1).optional(),
  task_id: z.string().min(1).optional(),
});

function getResponseIdFromUrl(url: string): string | null {
  const params = new URL(url).searchParams;
  return params.get("response_id") ?? params.get("task_id");
}

function normalizeResponseId(payload: { response_id?: string; task_id?: string }): string | null {
  return payload.response_id ?? payload.task_id ?? null;
}

export async function GET(request: Request) {
  try {
    const responseId = getResponseIdFromUrl(request.url);
    if (!responseId) return Response.json({ error: "response_id is required" }, { status: 400 });
    const response = await retrieveManusResponse(responseId);
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const responseId = normalizeResponseId(payload);
    if (!responseId) return Response.json({ error: "response_id is required" }, { status: 400 });
    const response = await retrieveManusResponse(responseId);
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
