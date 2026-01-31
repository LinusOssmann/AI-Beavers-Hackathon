import { selectLocationSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const parsed = selectLocationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { locationId } = parsed.data;

    const location = await prisma.location.findFirst({
      where: { id: locationId, planId },
    });
    if (!location) {
      return NextResponse.json(
        { error: "Location not found for this plan" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.location.updateMany({
        where: { planId },
        data: { isSelected: false },
      }),
      prisma.location.update({
        where: { id: locationId },
        data: { isSelected: true },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/plans/[planId]/select/location", e);
    return NextResponse.json(
      { error: "Failed to select location" },
      { status: 500 }
    );
  }
}
