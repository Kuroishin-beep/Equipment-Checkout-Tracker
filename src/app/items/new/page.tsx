import type { Metadata } from "next";
import ItemForm from "@/components/ItemForm";

export const metadata: Metadata = {
  title: "Add Equipment · Equipment Checkout Tracker",
};

// A Server Component with nothing async in it. It has no data to fetch — it
// just renders the client form inside a heading and a card. Keeping it a
// Server Component means the page shell itself ships no JavaScript; only
// ItemForm crosses the boundary.
export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        Add Equipment
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Register a new item in the equipment tracker.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <ItemForm />
      </div>
    </div>
  );
}