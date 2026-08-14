import Link from "next/link";
import { listItems } from "@/lib/items";
import ItemTable from "@/components/ItemTable";
import EmptyState from "@/components/EmptyState";

// An async Server Component. It awaits the database directly — no useEffect, no
// loading state, no fetch to our own API. The HTML arrives with the data
// already in it.
export default async function DashboardPage() {
  const items = await listItems();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Equipment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} {items.length === 1 ? "item" : "items"} tracked
          </p>
        </div>

        <Link
          href="/items/new"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Add Equipment
        </Link>
      </div>

      <div className="mt-6">
        {items.length === 0 ? <EmptyState /> : <ItemTable items={items} />}
      </div>
    </div>
  );
}