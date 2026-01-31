import { NextResponse } from "next/server";
import z from "zod";

export default async function getBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T | NextResponse> {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "The payload isn't right.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  return parsed.data;
}
