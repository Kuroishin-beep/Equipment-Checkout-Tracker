/**
 * Formats a "YYYY-MM-DD" string for display.
 *
 * Both the parse and the format are pinned to UTC. `new Date("2026-07-28")`
 * is parsed as UTC midnight, so formatting it in a timezone behind UTC would
**/

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}