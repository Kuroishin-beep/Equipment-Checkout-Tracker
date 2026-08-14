import { listItems, getStats } from "@/lib/items";
import { STATUSES, SORTS, type Status, type SortKey } from "@/lib/types";
import ItemTable from "@/components/ItemTable";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import SearchSortBar from "@/components/SearchSortBar";
import StatsCards from "@/components/StatsCards";

// The query string is untrusted input. Anything unrecognised falls back to a
// safe default rather than reaching SQL. Repeated params arrive as arrays.
function parseStatus(raw: string | string[] | undefined): Status | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  return (STATUSES as readonly string[]).includes(value) ? (value as Status) : null;
}

function parseSort(raw: string | string[] | undefined): SortKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const allowed = SORTS.map((s) => s.value) as readonly string[];
  return value && allowed.includes(value) ? (value as SortKey) : "date-desc";
}

function parseQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  // Capped so a pathological URL cannot become a huge ILIKE pattern.
  return (value ?? "").trim().slice(0, 120);
}

export default async function DashboardPage(props: PageProps<"/">) {
  // searchParams is a Promise in Next 15+, like params.
  const searchParams = await props.searchParams;
  const status = parseStatus(searchParams.status);
  const q = parseQuery(searchParams.q);
  const sort = parseSort(searchParams.sort);

  // Concurrent: the two queries do not depend on each other.
  const [items, stats] = await Promise.all([
    listItems({ status, q, sort }),
    getStats(),
  ]);

  const isFiltered = status !== null || q !== "";

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Equipment
        </h1>
        <p className="mt-1 text-sm text-muted">
          {items.length} {items.length === 1 ? "item" : "items"}
          {isFiltered ? " matching" : " tracked"}
        </p>
      </div>

      {/* Stats are deliberately unfiltered — a summary of everything. */}
      <div className="mt-6">
        <StatsCards total={stats.total} byStatus={stats.byStatus} />
      </div>

      <div className="mt-6">
        <SearchSortBar q={q} status={status} sort={sort} />
      </div>

      <div className="mt-4">
        <FilterBar active={status} q={q} sort={sort} />
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : (
          <ItemTable items={items} />
        )}
      </div>
    </div>
  );
}
