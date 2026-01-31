import { NextRequest, NextResponse } from "next/server";
import { AccommodationService } from "@/lib/services/accommodation.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const locationId = searchParams.get("locationId");
    const isSelected = searchParams.get("isSelected");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await AccommodationService.getAccommodations({
      planId: planId ?? undefined,
      locationId: locationId ?? undefined,
      isSelected: isSelected !== null ? isSelected === "true" : undefined,
      type: type ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ data: result.accommodations, total: result.total });
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

    const accommodation = await AccommodationService.createAccommodation({
      locationId,
      planId,
      name,
      type,
      address,
      price,
      rating,
      description,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      isSelected,
    });

    return NextResponse.json({ data: accommodation }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Plan or location not found" || error.message === "Location does not belong to the specified plan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error creating accommodation:", error);
    return NextResponse.json({ error: "Failed to create accommodation" }, { status: 500 });
  }
}
