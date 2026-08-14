// The allowed values, declared once. The Zod schema, the badge colour maps and
// the filter dropdown all read from these arrays — so adding a fifth status is
// a one-line change here rather than a hunt through the codebase.

export const STATUSES = ["Available", "Checked Out", "Under Repair", "Retired"] as const;
export const CONDITIONS = ["New", "Good", "Fair", "Poor"] as const;

export type Status = (typeof STATUSES)[number];
export type Condition = (typeof CONDITIONS)[number];


// What a row looks like once it has crossed out of the database and into React.
export type Item = {
  id: string;
  itemName: string;
  assignedTo: string;
  status: Status;
  condition: Condition;
  checkoutDate: string;
  notes: string | null;
};
