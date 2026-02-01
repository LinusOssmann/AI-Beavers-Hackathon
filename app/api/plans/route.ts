/**
 * GET /api/plans - list plans for the authenticated user.
 * POST /api/plans - create a plan (userId from auth). Body: createPlanSchema.
 */
import getBody from "@/app/api/lib/getBody";
import { createPlanSchema } from "@/app/api/routes.schemas";
import { authenticateRequest, unauthorizedResponse } from "@/lib/auth-utils";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User session required (userId from authentication)." },
        { status: 400 }
      );
    }
    const plans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error fetching plans." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }
    const body = await getBody(request, createPlanSchema);
    if (body instanceof NextResponse) return body;

    const { title, description, startDate, endDate } = body;
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User session required (userId from authentication)." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "The user wasn't found." },
        { status: 404 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        userId,
        title,
        description: description ?? null,
        startDate: startDate != null ? new Date(startDate) : null,
        endDate: endDate != null ? new Date(endDate) : null,
        generationStatus: "idle", // Initialize with idle status
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error creating that plan." },
      { status: 500 }
    );
  }
}
