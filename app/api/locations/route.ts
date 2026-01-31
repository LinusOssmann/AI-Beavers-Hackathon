import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const isSelected = searchParams.get("isSelected");
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const where: Record<string, any> = {};
    if (planId) where.planId = planId;
    if (isSelected !== null) where.isSelected = isSelected === "true";
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (city) where.city = { contains: city, mode: "insensitive" };

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        take: limit ? Number(limit) : undefined,
        skip: offset ? Number(offset) : undefined,
        orderBy: { createdAt: "desc" },
        include: { plan: { select: { id: true, title: true, userId: true } } },
      }),
      prisma.location.count({ where }),
    ]);

    return NextResponse.json({ data: locations, total });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planId, name, city, country, latitude, longitude, description, isSelected } =
      await request.json();

    if (!planId || !name || !country) {
      return NextResponse.json(
        { error: "Missing required fields: planId, name, country" },
        { status: 400 }
      );
    }

    if (isSelected) {
      await prisma.location.updateMany({
        where: { planId, isSelected: true },
        data: { isSelected: false },
      });
    }

    const location = await prisma.location.create({
      data: {
        planId,
        name,
        country,
        city: city ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        description: description ?? null,
        isSelected: isSelected ?? false,
      },
      include: { plan: { select: { id: true, title: true, userId: true } } },
    });

    return NextResponse.json({ data: location }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    console.error("Error creating location:", error);
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
