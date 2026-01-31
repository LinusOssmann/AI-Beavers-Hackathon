import { selectActivitiesSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const parsed = selectActivitiesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { activityIds } = parsed.data;

    const count = await prisma.activity.count({
      where: { id: { in: activityIds }, planId },
    });
    if (count !== activityIds.length) {
      return NextResponse.json(
        { error: "One or more activities not found for this plan" },
        { status: 404 }
      );
    }

    await prisma.activity.updateMany({
      where: { id: { in: activityIds }, planId },
      data: { isSelected: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/plans/[planId]/select/activities", e);
    return NextResponse.json(
      { error: "Failed to select activities" },
      { status: 500 }
    );
  }
}
