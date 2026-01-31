import { NextRequest, NextResponse } from "next/server";
import { LocationService } from "@/lib/services/location.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const isSelected = searchParams.get("isSelected");
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await LocationService.getLocations({
      planId: planId ?? undefined,
      isSelected: isSelected !== null ? isSelected === "true" : undefined,
      country: country ?? undefined,
      city: city ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ data: result.locations, total: result.total });
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

    const location = await LocationService.createLocation({
      planId,
      name,
      city,
      country,
      latitude,
      longitude,
      description,
      isSelected,
    });

    return NextResponse.json({ data: location }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Plan not found") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    console.error("Error creating location:", error);
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
