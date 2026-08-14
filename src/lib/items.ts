import { sql } from "./db";
import { STATUSES, type Item, type Status } from "@/lib/types";
import type { ItemInput } from "./validation";

// The raw shape Postgres hands back — snake_case, exactly as the columns are
// named. Declaring it makes the cast below an honest claim rather than `any`.
type ItemRow = {
  id: string;
  item_name: string;
  assigned_to: string;
  status: Item["status"];
  condition: Item["condition"];
  checkout_date: string;
  notes: string | null;
};

// The ONE place snake_case becomes camelCase. Rename a column and this is the
// only function that changes.
function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    itemName: row.item_name,
    assignedTo: row.assigned_to,
    status: row.status,
    condition: row.condition,
    checkoutDate: row.checkout_date,
    notes: row.notes,
  };
}

// Postgres raises "invalid input syntax for type uuid" for a malformed id,
// which would surface as a 500 where a 404 is correct. Checking the shape first
// turns /items/banana into a clean "not found".
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// An empty notes box arrives as "" after Zod trims it, and an omitted one as
// undefined. The column is nullable, and "" is not the same thing as NULL — so
// both collapse to NULL here rather than storing an empty string.
function normaliseNotes(notes: string | undefined): string | null {
  return notes && notes.trim() ? notes.trim() : null;
}

export async function listItems(
  options: { status?: Status | null } = {}
): Promise<Item[]> {
  const status = options.status ?? null;

  // The filter disables itself. You cannot concatenate a WHERE clause into a
  // tagged template, so instead the condition is written to be always-true when
  // the parameter is NULL. One query serves both "all items" and "filtered".
  const rows = await sql`
    SELECT id, item_name, assigned_to, status, condition,
           to_char(checkout_date, 'YYYY-MM-DD') AS checkout_date, notes
    FROM items
    WHERE (${status}::text IS NULL OR status = ${status})
    ORDER BY checkout_date DESC, created_at DESC
  `;

  return (rows as ItemRow[]).map(rowToItem);
}

export async function getItem(id: string): Promise<Item | null> {
  if (!UUID_RE.test(id)) return null;

  const rows = await sql`
    SELECT id, item_name, assigned_to, status, condition,
           to_char(checkout_date, 'YYYY-MM-DD') AS checkout_date, notes
    FROM items
    WHERE id = ${id}
  `;

  const row = (rows as ItemRow[])[0];
  return row ? rowToItem(row) : null;
}

export async function createItem(input: ItemInput): Promise<Item> {
  const rows = await sql`
    INSERT INTO items (item_name, assigned_to, status, condition, checkout_date, notes)
    VALUES (${input.itemName}, ${input.assignedTo}, ${input.status},
            ${input.condition}, ${input.checkoutDate}, ${normaliseNotes(input.notes)})
    RETURNING id, item_name, assigned_to, status, condition,
              to_char(checkout_date, 'YYYY-MM-DD') AS checkout_date, notes
  `;

  return rowToItem((rows as ItemRow[])[0]);
}

export async function updateItem(id: string, input: ItemInput): Promise<Item | null> {
  if (!UUID_RE.test(id)) return null;

  const rows = await sql`
    UPDATE items
    SET item_name     = ${input.itemName},
        assigned_to   = ${input.assignedTo},
        status        = ${input.status},
        condition     = ${input.condition},
        checkout_date = ${input.checkoutDate},
        notes         = ${normaliseNotes(input.notes)},
        updated_at    = now()
    WHERE id = ${id}
    RETURNING id, item_name, assigned_to, status, condition,
              to_char(checkout_date, 'YYYY-MM-DD') AS checkout_date, notes
  `;

  const row = (rows as ItemRow[])[0];
  return row ? rowToItem(row) : null;
}

export async function getStats(): Promise<{
  total: number;
  byStatus: Record<Status, number>;
}> {
  // count(*) returns bigint in Postgres, and drivers hand bigint back as a
  // STRING because a JS number can't safely hold the full range. ::int casts
  // it to something that arrives as a real number — without it, "5" + "2"
  // would concatenate instead of adding.
  const rows = (await sql`
    SELECT status, count(*)::int AS count
    FROM items
    GROUP BY status
  `) as { status: Status; count: number }[];

  // GROUP BY only returns statuses that have at least one row. Starting from
  // zero for all four means "Retired: 0" still renders instead of vanishing.
  const byStatus = Object.fromEntries(
    STATUSES.map((status) => [status, 0])
  ) as Record<Status, number>;

  let total = 0;
  for (const row of rows) {
    byStatus[row.status] = row.count;
    total += row.count;
  }

  return { total, byStatus };
}

export async function deleteItem(id: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;

  // RETURNING id makes the result array empty when nothing matched, which is
  // how the caller distinguishes "deleted" from "never existed".
  const rows = await sql`DELETE FROM items WHERE id = ${id} RETURNING id`;
  return (rows as { id: string }[]).length > 0;
}

