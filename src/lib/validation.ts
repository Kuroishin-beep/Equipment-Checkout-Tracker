import { z } from "zod";
import { STATUSES, CONDITIONS } from "./types";

// The six user-editable fields. `id` is the database's business, so it is not
// here — a client is never allowed to choose its own primary key.
export const itemInputSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(120, "Item name must be 120 characters or fewer"),

  assignedTo: z
    .string()
    .trim()
    .min(1, "Assigned to is required")
    .max(120, "Assigned to must be 120 characters or fewer"),

  status: z.enum(STATUSES, { error: "Select a valid status" }),
  condition: z.enum(CONDITIONS, { error: "Select a valid condition" }),

  // z.iso.date() checks calendar validity, not just shape: it accepts
  // "2026-07-28" and rejects "2026-02-31", which a regex alone would let past.
  checkoutDate: z.iso.date("Checkout date must be a valid YYYY-MM-DD date"),

  // The only optional field in the exam's data model.
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional(),
});

// Derived from the schema rather than written by hand, so the two cannot drift.
export type ItemInput = z.infer<typeof itemInputSchema>;