"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { itemInputSchema, type ItemInput } from "@/lib/validation";
import { STATUSES, CONDITIONS, type Item } from "@/lib/types";
import { useToast } from "./ToastProvider";

// Same shape z.flattenError produces AND the shape the API returns on a 400, so
// client and server failures render through identical markup.
type FieldErrors = Partial<Record<keyof ItemInput, string[]>>;

const inputBase =
  "mt-1 block w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:outline-none focus:ring-2 disabled:opacity-60";
const inputOk = "border-line focus:border-brand focus:ring-brand";
const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-500";
const labelClass = "block text-sm font-medium text-ink";
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600 dark:text-red-400">
      {messages[0]}
    </p>
  );
}

// One component for create and edit. The presence of `item` decides which.
export default function ItemForm({ item }: { item?: Item }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(item);

  const [values, setValues] = useState<ItemInput>({
    itemName: item?.itemName ?? "",
    assignedTo: item?.assignedTo ?? "",
    status: item?.status ?? "Available",
    condition: item?.condition ?? "Good",
    // Not defaulted to today: computing it would run on server and client and
    // could differ across timezones, causing a hydration mismatch.
    checkoutDate: item?.checkoutDate ?? "",
    notes: item?.notes ?? "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ItemInput>(field: K, value: ItemInput[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error as soon as the field is edited.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Without this the browser does its own full-page submit and the fetch
    // below never runs.
    event.preventDefault();
    setFormError(null);

    // Client-side pass for instant feedback. The same schema runs again in the
    // route handler, because the API is public.
    const parsed = itemInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // An HTML form can only send GET or POST. PUT needs fetch — which is why
      // this component needs "use client" at all.
      const response = await fetch(isEdit ? `/api/items/${item!.id}` : "/api/items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        if (response.status === 400 && payload?.fieldErrors) {
          setErrors(payload.fieldErrors);
        } else {
          setFormError(payload?.error ?? "Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      const saved: Item = await response.json();

      toast(isEdit ? `"${saved.itemName}" updated` : `"${saved.itemName}" added`);

      // push navigates; refresh re-runs the Server Components so the list is
      // current. The button stays disabled — POST is not idempotent.
      router.push(isEdit ? `/items/${saved.id}` : "/");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    // noValidate so Zod owns validation — otherwise browser bubbles and inline
    // messages would both appear for the same form.
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-200"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="itemName" className={labelClass}>
            Item name <span className="text-red-500">*</span>
          </label>
          <input
            id="itemName"
            type="text"
            value={values.itemName}
            onChange={(e) => update("itemName", e.target.value)}
            disabled={submitting}
            // aria-* is what connects the error text to the field; a red border
            // says nothing to a screen reader.
            aria-invalid={Boolean(errors.itemName)}
            aria-describedby={errors.itemName ? "itemName-error" : undefined}
            className={`${inputBase} ${errors.itemName ? inputBad : inputOk}`}
            placeholder="MacBook Pro 16-inch"
          />
          <FieldError id="itemName-error" messages={errors.itemName} />
        </div>

        <div>
          <label htmlFor="assignedTo" className={labelClass}>
            Assigned to <span className="text-red-500">*</span>
          </label>
          <input
            id="assignedTo"
            type="text"
            value={values.assignedTo}
            onChange={(e) => update("assignedTo", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.assignedTo)}
            aria-describedby={errors.assignedTo ? "assignedTo-error" : undefined}
            className={`${inputBase} ${errors.assignedTo ? inputBad : inputOk}`}
            placeholder="Unassigned"
          />
          <FieldError id="assignedTo-error" messages={errors.assignedTo} />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Status <span className="text-red-500">*</span>
          </label>
          {/* Options come from the same array the schema and badges use. */}
          <select
            id="status"
            value={values.status}
            onChange={(e) => update("status", e.target.value as ItemInput["status"])}
            disabled={submitting}
            className={`${inputBase} ${errors.status ? inputBad : inputOk}`}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <FieldError id="status-error" messages={errors.status} />
        </div>

        <div>
          <label htmlFor="condition" className={labelClass}>
            Condition <span className="text-red-500">*</span>
          </label>
          <select
            id="condition"
            value={values.condition}
            onChange={(e) => update("condition", e.target.value as ItemInput["condition"])}
            disabled={submitting}
            className={`${inputBase} ${errors.condition ? inputBad : inputOk}`}
          >
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
          <FieldError id="condition-error" messages={errors.condition} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkoutDate" className={labelClass}>
            Checkout date <span className="text-red-500">*</span>
          </label>
          {/* type="date" IS the date picker, and it speaks YYYY-MM-DD — the same
              format the DATE column and the Item type use, so no conversion. */}
          <input
            id="checkoutDate"
            type="date"
            value={values.checkoutDate}
            onChange={(e) => update("checkoutDate", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.checkoutDate)}
            aria-describedby={errors.checkoutDate ? "checkoutDate-error" : undefined}
            className={`${inputBase} ${errors.checkoutDate ? inputBad : inputOk}`}
          />
          <FieldError id="checkoutDate-error" messages={errors.checkoutDate} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className={labelClass}>
            Notes <span className="text-muted">(optional)</span>
          </label>
          {/* ?? "" because a controlled input must never receive undefined. */}
          <textarea
            id="notes"
            rows={4}
            value={values.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? "notes-error" : undefined}
            className={`${inputBase} ${errors.notes ? inputBad : inputOk}`}
            placeholder="Serial number, accessories, condition details…"
          />
          <FieldError id="notes-error" messages={errors.notes} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>

        <Link
          href={isEdit ? `/items/${item!.id}` : "/"}
          className={`rounded-md px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink ${focus}`}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
