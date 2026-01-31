import getBody from "@/app/api/lib/getBody";
import { selectAccommodationSchema } from "@/app/api/routes.schemas";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { selectAccommodation } from "@/lib/services/accommodation.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }
    const { planId } = await params;

    const body = await getBody(request, selectAccommodationSchema);
    if (body instanceof NextResponse) return body;

    const { accommodationId } = body;

    const ok = await selectAccommodation(planId, accommodationId);
    if (!ok) {
      return NextResponse.json(
        { error: "This accommodation wasn't found for this plan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that accommodation." },
      { status: 500 }
    );
  }
}
