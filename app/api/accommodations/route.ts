import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const locationId = searchParams.get("locationId");
    const isSelected = searchParams.get("isSelected");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const where: Record<string, any> = {};
    if (planId) where.planId = planId;
    if (locationId) where.locationId = locationId;
    if (isSelected !== null) where.isSelected = isSelected === "true";
    if (type) where.type = { contains: type, mode: "insensitive" };

    const [accommodations, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        take: limit ? Number(limit) : undefined,
        skip: offset ? Number(offset) : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          plan: { select: { id: true, title: true, userId: true } },
          location: { select: { id: true, name: true, city: true, country: true } },
        },
      }),
      prisma.accommodation.count({ where }),
    ]);

    return NextResponse.json({ data: accommodations, total });
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return NextResponse.json({ error: "Failed to fetch accommodations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locationId, planId, name, type, address, price, rating, description, checkIn, checkOut, isSelected } =
      await request.json();

    if (!locationId || !planId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: locationId, planId, name" },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location || location.planId !== planId) {
      return NextResponse.json(
        { error: "Location does not belong to the specified plan" },
        { status: 400 }
      );
    }

    if (isSelected) {
      await prisma.accommodation.updateMany({
        where: { planId, isSelected: true },
        data: { isSelected: false },
      });
    }

    const accommodation = await prisma.accommodation.create({
      data: {
        locationId,
        planId,
        name,
        type: type ?? null,
        address: address ?? null,
        price: price ?? null,
        rating: rating ?? null,
        description: description ?? null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        isSelected: isSelected ?? false,
      },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true } },
      },
    });

    return NextResponse.json({ data: accommodation }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan or location not found" }, { status: 404 });
    }
    console.error("Error creating accommodation:", error);
    return NextResponse.json({ error: "Failed to create accommodation" }, { status: 500 });
  }
}
