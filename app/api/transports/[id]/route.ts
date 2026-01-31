import { NextRequest, NextResponse } from "next/server";
import { TransportService } from "@/lib/services/transport.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transport = await TransportService.getTransportById(id);
    return NextResponse.json({ data: transport });
  } catch (error: any) {
    if (error.message === "Transport not found") {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }
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
    const { type, name, from, to, price, departure, arrival, description, isSelected, locationId, planId } =
      await request.json();

    const transport = await TransportService.updateTransport(id, {
      type,
      name,
      from,
      to,
      price,
      departure: departure ? new Date(departure) : null,
      arrival: arrival ? new Date(arrival) : null,
      description,
      isSelected,
      locationId,
      planId,
    });

    return NextResponse.json({ data: transport });
  } catch (error: any) {
    if (error.message === "Transport not found") {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }
    if (error.message === "Plan or location not found" || error.message === "Location does not belong to the specified plan") {
      return NextResponse.json({ error: error.message }, { status: 404 });
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
    await TransportService.deleteTransport(id);
    return NextResponse.json({ message: "Transport deleted successfully" });
  } catch (error: any) {
    if (error.message === "Transport not found") {
      return NextResponse.json({ error: "Transport not found" }, { status: 404 });
    }
    console.error("Error deleting transport:", error);
    return NextResponse.json({ error: "Failed to delete transport" }, { status: 500 });
  }
}
