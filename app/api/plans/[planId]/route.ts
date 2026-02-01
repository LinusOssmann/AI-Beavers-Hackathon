/**
 * GET /api/plans/[planId] - fetch a plan with locations, accommodations, activities, transports.
 * Requires auth; users can only access their own plans.
 */
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }
    const { planId } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        locations: {
          include: {
            accommodations: true,
            activities: true,
            transports: true,
          },
        },
      },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }
    if (
      authResult.userId !== null &&
      plan.userId !== authResult.userId
    ) {
      return NextResponse.json(
        { error: "Forbidden - you can only access your own plans." },
        { status: 403 }
      );
    }
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error fetching that plan." },
      { status: 500 }
    );
  }
}
