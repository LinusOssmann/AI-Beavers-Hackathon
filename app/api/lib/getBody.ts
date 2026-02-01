/**
 * Parses and validates the request body with a Zod schema.
 * Returns the parsed data or a 400 NextResponse when validation fails.
 */
import { NextResponse } from "next/server";
import z from "zod";

/** Parses JSON body and validates with the given schema; returns data or error response. */
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
