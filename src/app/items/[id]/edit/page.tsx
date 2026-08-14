import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/items";
import ItemForm from "@/components/ItemForm";

const getCachedItem = cache(getItem);

export async function generateMetadata(
  props: PageProps<"/items/[id]/edit">
): Promise<Metadata> {
  const { id } = await props.params;
  const item = await getCachedItem(id);

  return {
    title: item
      ? `Edit ${item.itemName} · Equipment Checkout Tracker`
      : "Item not found · Equipment Checkout Tracker",
  };
}

export default async function EditItemPage(props: PageProps<"/items/[id]/edit">) {
  const { id } = await props.params;
  const item = await getCachedItem(id);

  // Without this, /items/banana/edit would render an empty form that 404s on
  // save. Failing up front beats failing after the user has typed.
  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/items/${item.id}`}
        className="inline-flex items-center rounded text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      >
        ← Back to item
      </Link>

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        Edit Equipment
      </h1>
      <p className="mt-1 text-sm text-muted">{item.itemName}</p>

      <div className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        {/* The whole edit feature. The Server Component fetches, the Client
            Component receives via props — only plain data crosses, which is why
            checkoutDate is a string and not a Date. */}
        <ItemForm item={item} />
      </div>
    </div>
  );
}
