"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { itemInputSchema, type ItemInput } from "@/lib/validation";
import { STATUSES, CONDITIONS, type Item } from "@/lib/types";

// Field-level errors keyed by field name. This is the exact shape
// z.flattenError produces AND the exact shape the API returns on a 400 —
// deliberately, so client-side and server-side failures land in the same state
// and render through the same markup. One error path, not two.
type FieldErrors = Partial<Record<keyof ItemInput, string[]>>;

const inputBase =
  "mt-1 block w-full rounded-md border px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500";
const inputOk = "border-slate-300 focus:border-slate-900 focus:ring-brand";
const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-500";
const labelClass = "block text-sm font-medium text-slate-700";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600">
      {messages[0]}
    </p>
  );
}

export default function ItemForm({ item }: { item?: Item }) {
  const router = useRouter();

  // The presence of `item` is what makes this a create form or an edit form.
  // Phase 10 reuses this component by passing one in.
  const isEdit = Boolean(item);

  const [values, setValues] = useState<ItemInput>({
    itemName: item?.itemName ?? "",
    assignedTo: item?.assignedTo ?? "",
    status: item?.status ?? "Available",
    condition: item?.condition ?? "Good",
    // Left empty rather than defaulting to today. Computing "today" here would
    // run during server render AND again on the client; if the two are in
    // different timezones they produce different dates and React reports a
    // hydration mismatch. The field is required, so the user picks.
    checkoutDate: item?.checkoutDate ?? "",
    notes: item?.notes ?? "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ItemInput>(field: K, value: ItemInput[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear this field's error the moment it is edited. Leaving a stale error
    // under a field the user has already fixed is actively confusing.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Without this the browser does its own full-page form submission and the
    // fetch below never runs.
    event.preventDefault();
    setFormError(null);

    // Client-side validation: instant feedback, no network round trip. The
    // SAME schema runs again in the route handler — this is a convenience for
    // honest users, never a security control.
    const parsed = itemInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // An HTML <form> can only send GET or POST — PUT is not available to it.
      // Using the correct verb requires fetch, and calling fetch from an event
      // handler requires a client runtime. The HTTP requirement and the
      // "use client" requirement are the same decision.
      const response = await fetch(isEdit ? `/api/items/${item!.id}` : "/api/items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);

        // A 400 with fieldErrors renders exactly like a client-side failure.
        if (response.status === 400 && payload?.fieldErrors) {
          setErrors(payload.fieldErrors);
        } else {
          setFormError(payload?.error ?? "Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      const saved: Item = await response.json();

      // revalidatePath in the route handler marked the cached pages stale;
      // router.refresh() is what actually re-runs the Server Components so the
      // dashboard shows the new row.
      router.push(isEdit ? `/items/${saved.id}` : "/");
      router.refresh();

      // Deliberately NOT re-enabling the button here. Navigation is in flight,
      // and POST is not idempotent — two submits would create two items.
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    // noValidate turns off the browser's own validation bubbles. Without it the
    // user would get browser popups for some errors and our inline messages for
    // others — two different UIs for the same problem.
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        // role="alert" makes a screen reader announce this the moment it appears.
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
            // aria-invalid and aria-describedby are what connect the error text
            // to the field for a screen reader. A red border says nothing.
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
          <select
            id="status"
            value={values.status}
            onChange={(e) => update("status", e.target.value as ItemInput["status"])}
            disabled={submitting}
            className={`${inputBase} ${errors.status ? inputBad : inputOk}`}
          >
            {/* Options come from the same array the Zod schema and the badge
                colours use. Add a fifth status in types.ts and it appears here
                automatically. */}
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
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
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
          <FieldError id="condition-error" messages={errors.condition} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkoutDate" className={labelClass}>
            Checkout date <span className="text-red-500">*</span>
          </label>
          {/* type="date" IS the date picker the exam asks for — the browser's
              native one. It reads and writes "YYYY-MM-DD" strings, which is
              exactly the format the DATE column and the Item type use, so the
              value passes end to end without a single conversion. */}
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
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={4}
            // ?? "" because notes is optional in the schema, but a controlled
            // input must never receive undefined — React would switch it to an
            // uncontrolled input and warn.
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

      <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create item"}
        </button>

        <Link
          href={isEdit ? `/items/${item!.id}` : "/"}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}