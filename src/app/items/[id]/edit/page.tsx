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

  // Same guard as the detail page. Without it, /items/banana/edit would render
  // an empty form that then 404s on save — confusing, and a worse failure than
  // saying "not found" up front.
  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/items/${item.id}`}
        className="inline-flex items-center rounded text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        ← Back to item
      </Link>

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        Edit Equipment
      </h1>
      <p className="mt-1 text-sm text-slate-500">{item.itemName}</p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        {/* This one line is the entire edit feature.
            ItemForm receives an `item`, so it: pre-fills every field from it,
            switches the request to PUT /api/items/{id}, relabels the button to
             "Save changes", and redirects to the detail page instead of the dashboard. */}
        <ItemForm item={item} />
      </div>
    </div>
  );
}