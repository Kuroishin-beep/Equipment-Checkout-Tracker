import type { SortKey } from "./types";

// Every dashboard link has to carry the other two filters, or clicking a status
// pill would silently discard your search. Built in one place.
export function dashboardHref(params: {
  status?: string | null;
  q?: string | null;
  sort?: SortKey | null;
}): string {
  const sp = new URLSearchParams();

  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  // date-desc is the default, so omitting it keeps the URL clean.
  if (params.sort && params.sort !== "date-desc") sp.set("sort", params.sort);

  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}
