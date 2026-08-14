import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { listItems, createItem } from "@/lib/items";
import { itemInputSchema } from "@/lib/validation";
import { STATUSES, type Status } from "@/lib/types";

// GET /api/items
// GET /api/items?status=Checked%20Out
export async function GET(request: Request) {
  try {
    // Plain Web API URL parsing — nothing Next-specific needed here.
    const statusParam = new URL(request.url).searchParams.get("status");

    // An unrecognised ?status= is a client error. Silently ignoring it and
    // returning everything would quietly answer a different question than the
    // one that was asked.
    if (statusParam !== null && !(STATUSES as readonly string[]).includes(statusParam)) {
      return NextResponse.json(
        { error: `Invalid status. Expected one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const items = await listItems({ status: statusParam as Status | null });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    // Log the real error server-side; return something generic to the client.
    // Database errors can leak schema details, so they do not go over the wire.
    console.error("GET /api/items failed:", error);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }
}

// POST /api/items
export async function POST(request: Request) {
  let body: unknown;

  // request.json() throws on malformed JSON. That is a 400, not a 500 — the server is fine, the request was not.
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  // Re-validated here even though the form will validate too. This URL is
  // public: anyone can curl it. The browser is not a trust boundary.
  const parsed = itemInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    const item = await createItem(parsed.data);

    // Tells the server-rendered dashboard its cached HTML is now stale.
    revalidatePath("/");
    // 201 Created is more precise than 200, and Location tells the client where the thing it just made now lives.
    return NextResponse.json(item, {
      status: 201,
      headers: { Location: `/api/items/${item.id}` },
    });
  } catch (error) {
    console.error("POST /api/items failed:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}