import Form from "next/form";
import Link from "next/link";
import { SORTS, type SortKey } from "@/lib/types";

const field =
  "mt-1 block w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand";
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// next/form gives client-side navigation on submit but is still a real form, so
// it works with JavaScript disabled. No hooks, so this stays a Server Component.
export default function SearchSortBar({
  q,
  status,
  sort,
}: {
  q: string;
  status: string | null;
  sort: SortKey;
}) {
  const hasFilters = Boolean(q) || Boolean(status) || sort !== "date-desc";

  return (
    <Form action="/" className="flex flex-wrap items-end gap-2">
      {/* The status pill lives outside this form, so it rides along hidden or
          searching would clear the filter. */}
      {status && <input type="hidden" name="status" value={status} />}

      <div className="min-w-0 flex-1 sm:max-w-xs">
        <label htmlFor="q" className="block text-xs font-medium text-muted">
          Search
        </label>
        {/* defaultValue, not value: the URL is the state, not React. */}
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Item name or person"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="sort" className="block text-xs font-medium text-muted">
          Sort by
        </label>
        <select id="sort" name="sort" defaultValue={sort} className={field}>
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={`rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
      >
        Apply
      </button>

      {hasFilters && (
        <Link
          href="/"
          className={`rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink ${focus}`}
        >
          Clear all
        </Link>
      )}
    </Form>
  );
}
