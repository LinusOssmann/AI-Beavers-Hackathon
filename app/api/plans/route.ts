import { createPlanSchema } from "@/app/api/routes.schemas";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId query is required" },
        { status: 400 }
      );
    }
    const plans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(plans);
  } catch (e) {
    console.error("GET /api/plans", e);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { userId, title, description, startDate, endDate } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = await prisma.plan.create({
      data: {
        userId,
        title,
        description: description ?? null,
        startDate: startDate != null ? new Date(startDate) : null,
        endDate: endDate != null ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(plan);
  } catch (e) {
    console.error("POST /api/plans", e);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
