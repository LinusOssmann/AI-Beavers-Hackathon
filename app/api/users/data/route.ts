/**
 * POST /api/users/data - save user context data (e.g. onboarding Q&A).
 * Body: dataPayloadSchema. User id comes from authentication.
 */
import getBody from "@/app/api/lib/getBody";
import { dataPayloadSchema } from "@/app/api/routes.schemas";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { updateUserContextData } from "@/lib/services/user.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }
    const body = await getBody(request, dataPayloadSchema);
    if (body instanceof NextResponse) return body;

    const { data } = body;
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User session required (userId from authentication)." },
        { status: 400 }
      );
    }

    const ok = await updateUserContextData(userId, data);
    if (!ok) {
      return NextResponse.json(
        { error: "The user wasn't found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error saving that data." },
      { status: 500 }
    );
  }
}
