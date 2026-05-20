import { NextRequest, NextResponse } from "next/server";
import { getTripWithDetails, updateTrip, deleteTrip } from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const trip = await getTripWithDetails(params.id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (error) {
    console.error("GET /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const updated = await updateTrip(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await deleteTrip(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
