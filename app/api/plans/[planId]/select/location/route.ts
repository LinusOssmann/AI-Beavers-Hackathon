import getBody from "@/app/api/lib/getBody";
import { selectLocationSchema } from "@/app/api/routes.schemas";
import { selectLocation } from "@/lib/services/location.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectLocationSchema);
    if (body instanceof NextResponse) return body;

    const { locationId } = body;

    const ok = await selectLocation(planId, locationId);
    if (!ok) {
      return NextResponse.json(
        { error: "This location wasn't found for this plan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that location." },
      { status: 500 }
    );
  }
}
