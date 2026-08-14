import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-base font-semibold text-slate-900">No equipment yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Nothing is being tracked. Add your first piece of equipment to get started.
      </p>
      <Link
        href="/items/new"
        className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Add Equipment
      </Link>
    </div>
  );
}