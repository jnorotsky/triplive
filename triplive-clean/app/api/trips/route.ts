import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getAllTrips, createTrip } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const trips = await getAllTrips();
    return NextResponse.json(trips);
  } catch (error) {
    console.error("GET /api/trips error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_name, destination, start_date, end_date } = body;

    if (!client_name || !destination) {
      return NextResponse.json(
        { error: "client_name and destination are required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const slug = slugify(client_name);

    const trip = await createTrip({
      id,
      slug,
      client_name,
      destination,
      start_date: start_date || "",
      end_date: end_date || "",
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
