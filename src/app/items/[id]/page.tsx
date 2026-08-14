import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/items";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ConditionBadge from "@/components/ConditionBadge";
import DeleteButton from "@/components/DeleteButton";

// React's cache() memoises a function for the lifetime of a single request.
// generateMetadata and the page component below both need the same item, and
// without this that would be two identical database queries per page load.
// Next.js dedupes fetch() automatically; it cannot dedupe an arbitrary async
// function, so this has to be explicit.
const getCachedItem = cache(getItem);

export async function generateMetadata(
  props: PageProps<"/items/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const item = await getCachedItem(id);

  return {
    title: item
      ? `${item.itemName} · Equipment Checkout Tracker`
      : "Item not found · Equipment Checkout Tracker",
  };
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  );
}

export default async function ItemDetailPage(props: PageProps<"/items/[id]">) {
  const { id } = await props.params;

  // Called directly, not through fetch("/api/items/..."). This code already
  // runs on the server — going out over HTTP to reach a function in the same
  // process would be a pointless network round trip.
  const item = await getCachedItem(id);

  // notFound() throws, so it never returns and nothing below it executes.
  // That is also why TypeScript narrows `item` to non-null from here on with
  // no cast needed. Next catches the throw, renders the nearest not-found.tsx,
  // and sends a real 404 status — not a 200 with an error message on it.
  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5 sm:p-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {item.itemName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Equipment record</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* <dl> because every one of these is a label/value pair. Same reasoning
            as the mobile cards on the dashboard: markup that describes the data,
            not just the layout. */}
        <dl className="divide-y divide-slate-100">
          <DetailRow label="Assigned to">{item.assignedTo}</DetailRow>

          <DetailRow label="Condition">
            <ConditionBadge condition={item.condition} />
          </DetailRow>

          <DetailRow label="Checkout date">{formatDate(item.checkoutDate)}</DetailRow>

          <DetailRow label="Notes">
            {item.notes ? (
              // whitespace-pre-wrap so line breaks the user typed survive.
              // Without it, HTML collapses every run of whitespace — including
              // newlines — into a single space.
              <p className="whitespace-pre-wrap">{item.notes}</p>
            ) : (
              <span className="text-slate-400">No notes</span>
            )}
          </DetailRow>
        </dl>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Edit
          </Link>
              <DeleteButton id={item.id} itemName={item.itemName} />
        </div>
      </div>
    </div>
  );
}