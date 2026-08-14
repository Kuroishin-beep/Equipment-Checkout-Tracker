import type { Status } from "@/lib/types";

// Full class strings, never built by concatenation — Tailwind scans source for
// complete literal names at build time, so `bg-${x}-100` generates no CSS.
// Record<Status, string> makes it exhaustive: a fifth status won't compile
// until it is given a colour here.
const STYLES: Record<Status, string> = {
  "Available":
    "bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/25",
  "Checked Out":
    "bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/25",
  "Under Repair":
    "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
  "Retired":
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/15 dark:text-slate-300 dark:ring-slate-400/25",
};

const DOTS: Record<Status, string> = {
  "Available": "bg-green-500",
  "Checked Out": "bg-blue-500",
  "Under Repair": "bg-amber-500",
  "Retired": "bg-slate-400",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {/* Decorative — the label already says it. */}
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status]}`} aria-hidden="true" />
      {status}
    </span>
  );
}
