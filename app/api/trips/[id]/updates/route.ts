import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createUpdate } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    if (!body.message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const update = await createUpdate({
      id: uuidv4(),
      trip_id: params.id,
      message: body.message,
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/[id]/updates error:", error);
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
  }
}
