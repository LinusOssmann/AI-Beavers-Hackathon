/**
 * POST /api/plans/[planId]/select/activities - set the selected activities for the plan.
 * Body: selectActivitiesSchema (activityIds array).
 */
import getBody from "@/app/api/lib/getBody";
import { selectActivitiesSchema } from "@/app/api/routes.schemas";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { selectActivities } from "@/lib/services/activity.service";
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

    const body = await getBody(request, selectActivitiesSchema);
    if (body instanceof NextResponse) return body;

    const { activityIds } = body;

    const ok = await selectActivities(
      planId,
      activityIds,
      authResult.userId
    );
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
