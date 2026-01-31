import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        locations: true,
        accommodations: true,
        activities: true,
        transports: true,
      },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (e) {
    console.error("GET /api/plans/[planId]", e);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
