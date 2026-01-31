import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const dataPayloadSchema = z.object({
  userId: z.string().min(1),
  data: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = dataPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { userId, data } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { contextData: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  } catch (e) {
    console.error("POST /api/users/data", e);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
