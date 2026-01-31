import { NextResponse } from "next/server";

/**
 * Simple GET endpoint to verify the MCP server is reachable (e.g. through ngrok).
 * GET /mcp/ping -> { ok: true, message: "MCP server is reachable" }
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "MCP server is reachable" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
