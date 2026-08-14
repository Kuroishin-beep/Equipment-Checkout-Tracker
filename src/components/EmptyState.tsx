import Link from "next/link";

const panel =
  "rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center";
const button =
  "mt-6 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// Two different empties. "Nothing matches your filter" and "nothing exists yet"
// look the same but mean opposite things, and need opposite calls to action.
export default function EmptyState({ filtered = false }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <div className={panel}>
        <h2 className="text-base font-semibold text-ink">No matching equipment</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          Nothing matches the current search or filter.
        </p>
        <Link href="/" className={button}>
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className={panel}>
      <h2 className="text-base font-semibold text-ink">No equipment yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
        Nothing is being tracked. Add your first piece of equipment to get started.
      </p>
      <Link href="/items/new" className={button}>
        Add Equipment
      </Link>
    </div>
  );
}
