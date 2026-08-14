// One array per set of allowed values. The Zod schema, badge colour maps and
// form dropdowns all read from these, so adding a value is a one-line change.
export const STATUSES = ["Available", "Checked Out", "Under Repair", "Retired"] as const;
export const CONDITIONS = ["New", "Good", "Fair", "Poor"] as const;

export const SORTS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "condition", label: "Condition (best first)" },
  { value: "name", label: "Name (A-Z)" },
] as const;

// `as const` above is what turns these into literal unions instead of string.
export type Status = (typeof STATUSES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type SortKey = (typeof SORTS)[number]["value"];

// A row after it has crossed out of the database. checkoutDate stays a
// "YYYY-MM-DD" string, never a Date — see lib/items.ts and lib/format.ts.
export type Item = {
  id: string;
  itemName: string;
  assignedTo: string;
  status: Status;
  condition: Condition;
  checkoutDate: string;
  notes: string | null;
};
