import getBody from "@/app/api/lib/getBody";
import { selectTransportSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    const body = await getBody(request, selectTransportSchema);
    if (body instanceof NextResponse) return body;

    const { transportId } = body;

    const transport = await prisma.transport.findFirst({
      where: { id: transportId, planId },
    });
    if (!transport) {
      return NextResponse.json(
        { error: "This transport wasn't found for this plan." },
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
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error selecting that transport." },
      { status: 500 }
    );
  }
}
