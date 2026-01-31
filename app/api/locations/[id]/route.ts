import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/lib/services/location.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const location = await LocationService.getLocationById(id);
    return NextResponse.json({ data: location });
  } catch (error: any) {
    if (error.message === "Location not found") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
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
    const { name, city, country, latitude, longitude, description, isSelected } =
      await request.json();

    const location = await LocationService.updateLocation(id, {
      name,
      city,
      country,
      latitude,
      longitude,
      description,
      isSelected,
    });

    return NextResponse.json({ data: location });
  } catch (error: any) {
    if (error.message === "Location not found") {
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
    await LocationService.deleteLocation(id);
    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    if (error.message === "Location not found") {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    console.error("Error deleting location:", error);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
