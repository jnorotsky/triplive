import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getItemsByTrip, createItem } from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const items = await getItemsByTrip(params.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/trips/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    // Calculate sort_order: get current max + 1
    const existing = await getItemsByTrip(params.id);
    const maxOrder = existing.reduce((max, item) => Math.max(max, item.sort_order), -1);

    const item = await createItem({
      id: uuidv4(),
      trip_id: params.id,
      day_date: body.day_date || "",
      time: body.time || "",
      type: body.type || "note",
      title: body.title,
      subtitle: body.subtitle || "",
      detail: body.detail || "",
      confirmation_number: body.confirmation_number || "",
      location: body.location || "",
      sort_order: maxOrder + 1,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
