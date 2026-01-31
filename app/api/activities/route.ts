import { NextRequest, NextResponse } from "next/server";
import { ActivityService } from "@/lib/services/activity.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const locationId = searchParams.get("locationId");
    const isSelected = searchParams.get("isSelected");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await ActivityService.getActivities({
      planId: planId ?? undefined,
      locationId: locationId ?? undefined,
      isSelected: isSelected !== null ? isSelected === "true" : undefined,
      type: type ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ data: result.activities, total: result.total });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locationId, planId, name, type, address, price, rating, description, duration, isSelected } =
      await request.json();

    if (!locationId || !planId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: locationId, planId, name" },
        { status: 400 }
      );
    }

    const activity = await ActivityService.createActivity({
      locationId,
      planId,
      name,
      type,
      address,
      price,
      rating,
      description,
      duration,
      isSelected,
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Plan or location not found" || error.message === "Location does not belong to the specified plan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
