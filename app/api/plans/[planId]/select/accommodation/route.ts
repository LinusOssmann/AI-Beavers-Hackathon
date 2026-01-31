import getBody from "@/app/api/lib/getBody";
import { selectAccommodationSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectAccommodationSchema);
    if (body instanceof NextResponse) return body;

    const { accommodationId } = body;

    const accommodation = await prisma.accommodation.findFirst({
      where: { id: accommodationId, planId },
    });
    if (!accommodation) {
      return NextResponse.json(
        { error: "This accommodation wasn't found for this plan." },
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
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that accommodation." },
      { status: 500 }
    );
  }
}
