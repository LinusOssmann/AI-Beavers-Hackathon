import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ accommodationId: z.string().min(1) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { accommodationId } = parsed.data;

    const accommodation = await prisma.accommodation.findFirst({
      where: { id: accommodationId, planId },
    });
    if (!accommodation) {
      return NextResponse.json(
        { error: "Accommodation not found for this plan" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.accommodation.updateMany({
        where: { planId },
        data: { isSelected: false },
      }),
      prisma.accommodation.update({
        where: { id: accommodationId },
        data: { isSelected: true },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/plans/[planId]/select/accommodation", e);
    return NextResponse.json(
      { error: "Failed to select accommodation" },
      { status: 500 }
    );
  }
}
