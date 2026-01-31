import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true, latitude: true, longitude: true } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json({ data: activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.activity.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const { name, type, address, price, rating, description, duration, isSelected, locationId, planId } =
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

    const data = Object.fromEntries(
      Object.entries({
        name,
        type,
        address,
        price,
        rating,
        description,
        duration,
        isSelected,
        locationId,
        planId,
      }).filter(([_, v]) => v !== undefined)
    );

    const activity = await prisma.activity.update({
      where: { id },
      data,
      include: {
        plan: { select: { id: true, title: true, userId: true } },
        location: { select: { id: true, name: true, city: true, country: true } },
      },
    });

    return NextResponse.json({ data: activity });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Plan or location not found" }, { status: 404 });
    }
    console.error("Error updating activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    console.error("Error deleting activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
