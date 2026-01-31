import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true, latitude: true, longitude: true } },
      },
    });

    if (!accommodation) {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
    }

    return NextResponse.json({ data: accommodation });
  } catch (error) {
    console.error("Error fetching accommodation:", error);
    return NextResponse.json({ error: "Failed to fetch accommodation" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.accommodation.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
    }

    const { name, type, address, price, rating, description, checkIn, checkOut, isSelected, locationId, planId } =
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
      await prisma.accommodation.updateMany({
        where: { planId: planId ?? existing.planId, isSelected: true, id: { not: id } },
        data: { isSelected: false },
      });
    }

    const data: Record<string, any> = Object.fromEntries(
      Object.entries({
        name,
        type,
        address,
        price,
        rating,
        description,
        checkIn: checkIn ? new Date(checkIn) : checkIn,
        checkOut: checkOut ? new Date(checkOut) : checkOut,
        isSelected,
        locationId,
        planId,
      }).filter(([_, v]) => v !== undefined)
    );

    const accommodation = await prisma.accommodation.update({
      where: { id },
      data,
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true } },
      },
    });

    return NextResponse.json({ data: accommodation });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan or location not found" }, { status: 404 });
    }
    console.error("Error updating accommodation:", error);
    return NextResponse.json({ error: "Failed to update accommodation" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.accommodation.delete({ where: { id } });
    return NextResponse.json({ message: "Accommodation deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
    }
    console.error("Error deleting accommodation:", error);
    return NextResponse.json({ error: "Failed to delete accommodation" }, { status: 500 });
  }
}
