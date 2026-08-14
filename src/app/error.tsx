"use client";

import { useEffect } from "react";
import Link from "next/link";

// Error boundaries must be Client Components. This is a hard Next.js
// requirement, not a stylistic choice — the file will not work without the
// directive, because the boundary has to attach on the client.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In PRODUCTION, Next strips the real message before it reaches the browser
    // and sends only a `digest` — a hash that matches the full error in the
    // server logs. That is deliberate: error messages leak schema and file
    // paths. So never render error.message and expect it to be useful; log it
    // and show the user something generic plus the digest to quote.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        The equipment data could not be loaded. This is usually temporary.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-slate-400">Ref: {error.digest}</p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {/* reset() re-renders the segment — a genuine retry of the failed
            render, not a page reload. */}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Try again
        </button>

        <Link
          href="/"
          className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}