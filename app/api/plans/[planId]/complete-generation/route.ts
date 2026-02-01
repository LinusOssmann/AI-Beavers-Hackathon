/**
 * POST /api/plans/[planId]/complete-generation - Mark plan generation as complete
 */
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }

    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User session required" },
        { status: 400 }
      );
    }

    const planId = params.planId;

    // Verify plan belongs to user
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    if (plan.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update generation status to completed
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        generationStatus: "completed",
        lastGeneratedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error completing generation:", error);
    return NextResponse.json(
      { error: "Failed to complete generation" },
      { status: 500 }
    );
  }
}
