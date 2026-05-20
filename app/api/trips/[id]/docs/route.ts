import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createDocument } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    if (!body.title || !body.url) {
      return NextResponse.json({ error: "title and url are required" }, { status: 400 });
    }

    const doc = await createDocument({
      id: uuidv4(),
      trip_id: params.id,
      title: body.title,
      url: body.url,
      doc_type: body.doc_type || "",
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips/[id]/docs error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
