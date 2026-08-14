import Link from "next/link";
import { STATUSES, type Status, type SortKey } from "@/lib/types";
import { dashboardHref } from "@/lib/url";

// "All" is the absence of the parameter, not ?status=All — keeps the unfiltered
// dashboard on a clean "/" with no magic string to special-case.
const OPTIONS: { label: string; value: Status | null }[] = [
  { label: "All", value: null },
  ...STATUSES.map((status) => ({ label: status, value: status })),
];

export default function FilterBar({
  active,
  q,
  sort,
}: {
  active: Status | null;
  q: string;
  sort: SortKey;
}) {
  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map(({ label, value }) => {
        const isActive = value === active;

        return (
          <Link
            key={label}
            // Carries the current search and sort through, so a pill narrows
            // the results instead of resetting them.
            href={dashboardHref({ status: value, q, sort })}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page ${
              isActive
                ? "bg-brand text-white"
                : "bg-surface text-muted ring-1 ring-inset ring-line hover:bg-page hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
