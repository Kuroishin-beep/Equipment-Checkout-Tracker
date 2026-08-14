"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  id,
  itemName,
}: {
  id: string;
  itemName: string;
}) {
  const router = useRouter();

  // A ref rather than state, because the dialog's open/closed state is owned by
  // the DOM element itself — showModal() and close() are imperative methods.
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setError(null); // clear any error left over from a previous attempt
    // showModal(), NOT show(). showModal is what makes it a real modal: the
    // browser traps focus inside it, closes it on Escape, renders it in the
    // top layer above everything regardless of z-index, and enables the
    // ::backdrop pseudo-element. Every one of those is a thing I would
    // otherwise have to implement, and probably get subtly wrong.
    dialogRef.current?.showModal();
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });

      // 204 No Content is success and carries no body. Calling
      // response.json() here would throw on an empty response.
      if (response.status === 204) {
        dialogRef.current?.close();
        // push() before refresh(): this page is about to stop existing, so
        // leave it first, then re-render the dashboard without the row.
        router.push("/");
        router.refresh();
        return;
      }

      // A 404 here is genuinely possible, not just defensive — someone else
      // may have deleted this item between the page loading and the click.
      if (response.status === 404) {
        setError("This item no longer exists. It may have already been deleted.");
      } else {
        setError("Could not delete this item. Please try again.");
      }
      setDeleting(false);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* A <button>, never an <a href>. DELETE is not a safe method, and
          browsers and link prefetchers follow links speculatively — a
          destructive action behind a link eventually fires without a click. */}
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        // m-auto because Tailwind's preflight zeroes the margin that would
        // otherwise centre a <dialog>. backdrop: targets ::backdrop.
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-brand/50"
        // Closes when the backdrop is clicked. The click lands on the <dialog>
        // itself only when it misses the content div inside it.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-5 sm:p-6">
          <h2 id="delete-dialog-title" className="text-base font-semibold text-slate-900">
            Delete this item?
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{itemName}</span> will be
            permanently removed. This cannot be undone.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={deleting}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}