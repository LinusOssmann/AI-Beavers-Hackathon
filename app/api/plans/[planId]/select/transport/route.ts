import { selectTransportSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const parsed = selectTransportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { transportId } = parsed.data;

    const transport = await prisma.transport.findFirst({
      where: { id: transportId, planId },
    });
    if (!transport) {
      return NextResponse.json(
        { error: "Transport not found for this plan" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.transport.updateMany({
        where: { planId },
        data: { isSelected: false },
      }),
      prisma.transport.update({
        where: { id: transportId },
        data: { isSelected: true },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/plans/[planId]/select/transport", e);
    return NextResponse.json(
      { error: "Failed to select transport" },
      { status: 500 }
    );
  }
}
