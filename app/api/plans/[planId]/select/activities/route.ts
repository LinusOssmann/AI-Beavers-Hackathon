import getBody from "@/app/api/lib/getBody";
import { selectActivitiesSchema } from "@/app/api/routes.schemas";
import { selectActivities } from "@/lib/services/activity.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectActivitiesSchema);
    if (body instanceof NextResponse) return body;

    const { activityIds } = body;

    const ok = await selectActivities(planId, activityIds);
    if (!ok) {
      return NextResponse.json(
        { error: "One or more activities weren't found for this plan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting those activities." },
      { status: 500 }
    );
  }
}
