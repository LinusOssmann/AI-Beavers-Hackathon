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

    const [transports, total] = await Promise.all([
      prisma.transport.findMany({
        where,
        take: limit ? Number(limit) : undefined,
        skip: offset ? Number(offset) : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          plan: { select: { id: true, title: true, userId: true } },
          location: { select: { id: true, name: true, city: true, country: true } },
        },
      }),
      prisma.transport.count({ where }),
    ]);

    return NextResponse.json({ data: transports, total });
  } catch (error) {
    console.error("Error fetching transports:", error);
    return NextResponse.json({ error: "Failed to fetch transports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locationId, planId, type, name, from, to, price, departure, arrival, description, isSelected } =
      await request.json();

    if (!locationId || !planId || !type) {
      return NextResponse.json(
        { error: "Missing required fields: locationId, planId, type" },
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
      await prisma.transport.updateMany({
        where: { planId, isSelected: true },
        data: { isSelected: false },
      });
    }

    const transport = await prisma.transport.create({
      data: {
        locationId,
        planId,
        type,
        name: name ?? null,
        from: from ?? null,
        to: to ?? null,
        price: price ?? null,
        departure: departure ? new Date(departure) : null,
        arrival: arrival ? new Date(arrival) : null,
        description: description ?? null,
        isSelected: isSelected ?? false,
      },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true } },
      },
    });

    return NextResponse.json({ data: transport }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan or location not found" }, { status: 404 });
    }
    console.error("Error creating transport:", error);
    return NextResponse.json({ error: "Failed to create transport" }, { status: 500 });
  }
}
