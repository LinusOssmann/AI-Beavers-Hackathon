import getBody from "@/app/api/lib/getBody";
import { selectLocationSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectLocationSchema);
    if (body instanceof NextResponse) return body;

    const { locationId } = body;

    const location = await prisma.location.findFirst({
      where: { id: locationId, planId },
    });

    if (!location) {
      return NextResponse.json(
        { error: "This location wasn't found for this plan." },
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
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that location." },
      { status: 500 }
    );
  }
}
