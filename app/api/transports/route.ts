import { NextRequest, NextResponse } from "next/server";
import { TransportService } from "@/lib/services/transport.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const planId = searchParams.get("planId");
    const locationId = searchParams.get("locationId");
    const isSelected = searchParams.get("isSelected");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await TransportService.getTransports({
      planId: planId ?? undefined,
      locationId: locationId ?? undefined,
      isSelected: isSelected !== null ? isSelected === "true" : undefined,
      type: type ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    return NextResponse.json({ data: result.transports, total: result.total });
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

    const transport = await TransportService.createTransport({
      locationId,
      planId,
      type,
      name,
      from,
      to,
      price,
      departure: departure ? new Date(departure) : null,
      arrival: arrival ? new Date(arrival) : null,
      description,
      isSelected,
    });

    return NextResponse.json({ data: transport }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Plan or location not found" || error.message === "Location does not belong to the specified plan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error creating transport:", error);
    return NextResponse.json({ error: "Failed to create transport" }, { status: 500 });
  }
}
