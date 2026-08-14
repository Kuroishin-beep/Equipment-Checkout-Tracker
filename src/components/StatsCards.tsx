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

// Display only. These were links to ?status= at first, which duplicated the
// FilterBar directly below them — two controls doing the same job. The tiles
// summarise, the pills filter.
const tile =
  "flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm";

export default function StatsCards({
  total,
  byStatus,
}: {
  total: number;
  byStatus: Record<Status, number>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div className={tile}>
        <span className="text-xs font-medium text-slate-500">Total</span>
        <span className="mt-1 text-2xl font-semibold text-slate-900">{total}</span>
      </div>

      {STATUSES.map((status) => (
        <div key={status} className={tile}>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
            {status}
          </span>
          <span className={`mt-1 text-2xl font-semibold ${NUMBER[status]}`}>
            {byStatus[status]}
          </span>
        </div>
      ))}
    </div>
  );
}