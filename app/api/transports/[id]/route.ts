import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transport = await prisma.transport.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true, latitude: true, longitude: true } },
      },
    });

    if (!transport) {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }

    return NextResponse.json({ data: transport });
  } catch (error) {
    console.error("Error fetching transport:", error);
    return NextResponse.json({ error: "Failed to fetch transport" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.transport.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }

    const { type, name, from, to, price, departure, arrival, description, isSelected, locationId, planId } =
      await request.json();

    if (locationId || planId) {
      const newLocationId = locationId ?? existing.locationId;
      const newPlanId = planId ?? existing.planId;
      const location = await prisma.location.findUnique({ where: { id: newLocationId } });

      if (!location || location.planId !== newPlanId) {
        return NextResponse.json(
          { error: "Location does not belong to the specified plan" },
          { status: 400 }
        );
      }
    }

    if (isSelected && !existing.isSelected) {
      await prisma.transport.updateMany({
        where: { planId: planId ?? existing.planId, isSelected: true, id: { not: id } },
        data: { isSelected: false },
      });
    }

    const data: Record<string, any> = Object.fromEntries(
      Object.entries({
        type,
        name,
        from,
        to,
        price,
        departure: departure ? new Date(departure) : departure,
        arrival: arrival ? new Date(arrival) : arrival,
        description,
        isSelected,
        locationId,
        planId,
      }).filter(([_, v]) => v !== undefined)
    );

    const transport = await prisma.transport.update({
      where: { id },
      data,
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true } },
      },
    });

    return NextResponse.json({ data: transport });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan or location not found" }, { status: 404 });
    }
    console.error("Error updating transport:", error);
    return NextResponse.json({ error: "Failed to update transport" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.transport.delete({ where: { id } });
    return NextResponse.json({ message: "Transport deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }
    console.error("Error deleting transport:", error);
    return NextResponse.json({ error: "Failed to delete transport" }, { status: 500 });
  }
}
