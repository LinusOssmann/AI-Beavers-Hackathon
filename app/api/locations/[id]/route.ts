import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        accommodations: true,
        activities: true,
        transports: true,
      },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ data: location });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.location.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const { name, city, country, latitude, longitude, description, isSelected } =
      await request.json();

    if (isSelected && !existing.isSelected) {
      await prisma.location.updateMany({
        where: { planId: existing.planId, isSelected: true, id: { not: id } },
        data: { isSelected: false },
      });
    }

    const data = Object.fromEntries(
      Object.entries({
        name,
        city,
        country,
        latitude,
        longitude,
        description,
        isSelected,
      }).filter(([_, v]) => v !== undefined)
    );

    const location = await prisma.location.update({
      where: { id },
      data,
      include: { plan: { select: { id: true, title: true, userId: true } } },
    });

    return NextResponse.json({ data: location });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    console.error("Error deleting location:", error);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
