import getBody from "@/app/api/lib/getBody";
import { dataPayloadSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await getBody(request, dataPayloadSchema);
    if (body instanceof NextResponse) return body;

    const { userId, data } = body;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { contextData: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "The user wasn't found." },
        { status: 404 }
      );
    }

    const contextData = (existing.contextData as Record<string, unknown>) ?? {};
    await prisma.user.update({
      where: { id: userId },
      data: {
        contextData: { ...contextData, data },
        contextUpdatedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error saving that data." },
      { status: 500 }
    );
  }
}
