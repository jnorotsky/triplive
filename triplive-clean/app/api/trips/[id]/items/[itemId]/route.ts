import { NextRequest, NextResponse } from "next/server";
import { updateItem, deleteItem, getItemsByTrip } from "@/lib/db";

type Params = { params: { id: string; itemId: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const updated = await updateItem(params.itemId, body);
    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/trips/[id]/items/[itemId] error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await deleteItem(params.itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trips/[id]/items/[itemId] error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

// PATCH is used for reordering: move item up or down
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const { direction } = body; // "up" or "down"

    const items = await getItemsByTrip(params.id);
    const idx = items.findIndex((i) => i.id === params.itemId);
    if (idx === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) {
      return NextResponse.json({ error: "Cannot move in that direction" }, { status: 400 });
    }

    // Swap sort_orders
    const currentOrder = items[idx].sort_order;
    const swapOrder = items[swapIdx].sort_order;

    await Promise.all([
      updateItem(params.itemId, { sort_order: swapOrder }),
      updateItem(items[swapIdx].id, { sort_order: currentOrder }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/trips/[id]/items/[itemId] error:", error);
    return NextResponse.json({ error: "Failed to reorder item" }, { status: 500 });
  }
}
