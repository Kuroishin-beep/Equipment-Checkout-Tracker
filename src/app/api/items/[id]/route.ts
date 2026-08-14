import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getItem, updateItem, deleteItem } from "@/lib/items";
import { itemInputSchema } from "@/lib/validation";

// In Next 15+ dynamic route params arrive as a Promise and must be awaited.
// Forgetting the await gives "params should be awaited before using its
// properties" — a very common upgrade trap.
type RouteContext = { params: Promise<{ id: string }> };

// GET /api/items/[id]
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const item = await getItem(id);

    // getItem returns null both for a well-formed id that matches nothing and
    // for a malformed id. Both are genuinely "not found" from the caller's
    // point of view, so both are 404 rather than 500.
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("GET /api/items/[id] failed:", error);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}

// PUT /api/items/[id] — full replacement, not a partial patch.
export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = itemInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    const item = await updateItem(id, parsed.data);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/items/${id}`);

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("PUT /api/items/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/items/[id]
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await deleteItem(id);

    // This is why deleteItem returns a boolean rather than void — without it
    // there would be no way to tell "removed a row" from "there was nothing
    // there", and both would wrongly report success.
    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/items/${id}`);

    // 204 No Content: succeeded, and there is deliberately no body — the row
    // is gone, so there is nothing meaningful to return. A 204 carrying a body
    // is invalid HTTP, which is why this uses NextResponse directly instead of
    // NextResponse.json().
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/items/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}