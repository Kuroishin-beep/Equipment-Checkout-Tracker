import Link from "next/link";
import { STATUSES, type Status } from "@/lib/types";

const NUMBER: Record<Status, string> = {
  "Available": "text-green-700",
  "Checked Out": "text-blue-700",
  "Under Repair": "text-amber-700",
  "Retired": "text-slate-500",
};

const DOT: Record<Status, string> = {
  "Available": "bg-green-500",
  "Checked Out": "bg-blue-500",
  "Under Repair": "bg-amber-500",
  "Retired": "bg-slate-400",
};

const tile =
  "flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

export default function StatsCards({
  total,
  byStatus,
}: {
  total: number;
  byStatus: Record<Status, number>;
}) {
  return (
    // Each tile is a link to its own filter, so the stats row doubles as a
    // second way into the filtering that already exists. No new state.
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Link href="/" className={tile}>
        <span className="text-xs font-medium text-slate-500">Total</span>
        <span className="mt-1 text-2xl font-semibold text-slate-900">{total}</span>
      </Link>

      {STATUSES.map((status) => (
        <Link
          key={status}
          href={`/?status=${encodeURIComponent(status)}`}
          className={tile}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
            {status}
          </span>
          <span className={`mt-1 text-2xl font-semibold ${NUMBER[status]}`}>
            {byStatus[status]}
          </span>
        </Link>
      ))}
    </div>
  );
}