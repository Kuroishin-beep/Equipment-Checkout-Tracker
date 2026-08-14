import Link from "next/link";
import { STATUSES, type Status } from "@/lib/types";

// "All" is the ABSENCE of the query parameter, not ?status=All. That keeps the
// unfiltered dashboard on a clean "/" and means there is no magic string to
// special-case when parsing.
const OPTIONS: { label: string; value: Status | null }[] = [
  { label: "All", value: null },
  ...STATUSES.map((status) => ({ label: status, value: status })),
];

export default function FilterBar({ active }: { active: Status | null }) {
  return (
    // <nav> with a label, because this is a set of navigation choices. A screen
    // reader can jump straight to it and hear what it is for.
    <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map(({ label, value }) => {
        const isActive = value === active;

        // encodeURIComponent is not optional here: "Checked Out" and "Under
        // Repair" contain a space, which must be %20 in a URL.
        const href = value ? `/?status=${encodeURIComponent(value)}` : "/";

        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              isActive
                ? "bg-brand text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}