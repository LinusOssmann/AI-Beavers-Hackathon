import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { ok: true, message: "This server is reachable." },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
