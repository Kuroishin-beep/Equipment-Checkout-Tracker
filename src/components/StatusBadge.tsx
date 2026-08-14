import type { Status } from "@/lib/types";

// Complete class strings, never assembled by concatenation.
// Tailwind scans source files for literal class names at build time.

// Typing this as Record<Status, string> also makes it exhaustive: add a fifth
// status to types.ts and this object stops compiling until it gets a colour.
const STYLES: Record<Status, string> = {
  "Available": "bg-green-100 text-green-800 ring-green-600/20",
  "Checked Out": "bg-blue-100 text-blue-800 ring-blue-600/20",
  "Under Repair": "bg-amber-100 text-amber-800 ring-amber-600/20",
  "Retired": "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}