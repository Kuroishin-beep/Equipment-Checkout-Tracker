"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function DeleteButton({
  id,
  itemName,
}: {
  id: string;
  itemName: string;
}) {
  const router = useRouter();
  const toast = useToast();

  // A ref, not state: the dialog's open/closed state is owned by the DOM
  // element and exposed through showModal() / close().
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setError(null);
    // showModal(), not show(): the browser then traps focus, closes on Escape,
    // renders in the top layer, and enables ::backdrop.
    dialogRef.current?.showModal();
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });

      // 204 has no body — parsing it as JSON would throw on a request that
      // actually succeeded.
      if (response.status === 204) {
        dialogRef.current?.close();
        toast(`"${itemName}" deleted`);
        // Leave the page first; it is about to stop existing.
        router.push("/");
        router.refresh();
        return;
      }

      // A real race: another tab may have deleted it since this page rendered.
      setError(
        response.status === 404
          ? "This item no longer exists. It may have already been deleted."
          : "Could not delete this item. Please try again."
      );
      setDeleting(false);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* A button, never an <a>. DELETE is not safe, and prefetchers follow
          links speculatively. */}
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center rounded-md border border-red-400/60 bg-surface px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-page dark:text-red-400 dark:hover:bg-red-500/10"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        // m-auto because Tailwind's preflight zeroes the margin that would
        // otherwise centre a <dialog>.
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-slate-900/60"
        // Closes on backdrop click: the click hits the <dialog> itself only
        // when it misses the content inside.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-5 sm:p-6">
          <h2 id="delete-dialog-title" className="text-base font-semibold text-ink">
            Delete this item?
          </h2>

          <p className="mt-2 text-sm text-muted">
            <span className="font-medium text-ink">{itemName}</span> will be permanently
            removed. This cannot be undone.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-200"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={deleting}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
