import Link from "next/link";

const panel =
  "rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center";
const button =
  "mt-6 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

export default function EmptyState({ filtered = false }: { filtered?: boolean }) {
  // "No results for this filter" and "nothing exists yet" look identical but
  // mean completely different things. Showing "Add Equipment" to someone who
  // has 5 items and just picked a filter that matches none of them is
  // misleading — what they want is a way back.
  if (filtered) {
    return (
      <div className={panel}>
        <h2 className="text-base font-semibold text-slate-900">No matching equipment</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          No items currently have this status.
        </p>
        <Link href="/" className={button}>
          Clear filter
        </Link>
      </div>
    );
  }

  return (
    <div className={panel}>
      <h2 className="text-base font-semibold text-slate-900">No equipment yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Nothing is being tracked. Add your first piece of equipment to get started.
      </p>
      <Link href="/items/new" className={button}>
        Add Equipment
      </Link>
    </div>
  );
}