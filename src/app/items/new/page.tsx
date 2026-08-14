import type { Metadata } from "next";
import ItemForm from "@/components/ItemForm";

export const metadata: Metadata = {
  title: "Add Equipment · Equipment Checkout Tracker",
};

// A Server Component with nothing async in it — only ItemForm crosses the
// client boundary, so the page shell ships no JavaScript.
export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        Add Equipment
      </h1>
      <p className="mt-1 text-sm text-muted">
        Register a new item in the equipment tracker.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <ItemForm />
      </div>
    </div>
  );
}
