import Link from "next/link";
import { listItems } from "@/lib/items";
import { STATUSES, type Status } from "@/lib/types";
import ItemTable from "@/components/ItemTable";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";

// Never trust a query string. ?status=anything arrives here as an ordinary
// string typed by whoever is holding the URL bar. It is checked against the
// allowed list, and anything unrecognised falls back to "no filter" rather
// than being handed to SQL.
function parseStatus(raw: string | string[] | undefined): Status | null {
  // ?status=A&status=B arrives as an array. Take the first, ignore the rest.
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  return (STATUSES as readonly string[]).includes(value) ? (value as Status) : null;
}

export default async function DashboardPage(props: PageProps<"/">) {
  // searchParams is a Promise in Next 15+, exactly like params in a dynamic
  // route, and must be awaited before you can read a key off it.
  const searchParams = await props.searchParams;
  const status = parseStatus(searchParams.status);

  // The filter goes into the SQL WHERE clause. The database returns only the
  // matching rows — the browser never receives the ones it is not showing.
  const items = await listItems({ status });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Equipment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} {items.length === 1 ? "item" : "items"}
            {status ? ` · filtered by ${status}` : " tracked"}
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
        <FilterBar active={status} />
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <EmptyState filtered={status !== null} />
        ) : (
          <ItemTable items={items} />
        )}
      </div>
    </div>
  );
}