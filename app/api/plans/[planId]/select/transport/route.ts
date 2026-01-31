import getBody from "@/app/api/lib/getBody";
import { selectTransportSchema } from "@/app/api/routes.schemas";
import { selectTransport } from "@/lib/services/transport.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectTransportSchema);
    if (body instanceof NextResponse) return body;

    const { transportId } = body;

    const ok = await selectTransport(planId, transportId);
    if (!ok) {
      return NextResponse.json(
        { error: "This transport wasn't found for this plan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that transport." },
      { status: 500 }
    );
  }
}
