import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/items";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import ConditionBadge from "@/components/ConditionBadge";
import DeleteButton from "@/components/DeleteButton";

// cache() memoises for one request. generateMetadata and the component below
// both need this item; without it that is two identical queries per page load.
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
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="text-sm text-ink sm:col-span-2">{children}</dd>
    </div>
  );
}

export default async function ItemDetailPage(props: PageProps<"/items/[id]">) {
  const { id } = await props.params;
  // Called directly, not through the API — this already runs on the server.
  const item = await getCachedItem(id);

  // notFound() throws, so nothing below runs and `item` narrows to non-null.
  // It also sets a real 404 status, which a rendered message would not.
  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center rounded text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {item.itemName}
            </h1>
            <p className="mt-1 text-sm text-muted">Equipment record</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <dl className="divide-y divide-line">
          <DetailRow label="Assigned to">{item.assignedTo}</DetailRow>

          <DetailRow label="Condition">
            <ConditionBadge condition={item.condition} />
          </DetailRow>

          <DetailRow label="Checkout date">{formatDate(item.checkoutDate)}</DetailRow>

          <DetailRow label="Notes">
            {item.notes ? (
              // whitespace-pre-wrap or HTML collapses the user's line breaks.
              <p className="whitespace-pre-wrap">{item.notes}</p>
            ) : (
              <span className="text-muted">No notes</span>
            )}
          </DetailRow>
        </dl>

        <div className="flex flex-wrap items-center gap-3 border-t border-line bg-page p-5 sm:p-6">
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Edit
          </Link>

          <DeleteButton id={item.id} itemName={item.itemName} />
        </div>
      </div>
    </div>
  );
}
