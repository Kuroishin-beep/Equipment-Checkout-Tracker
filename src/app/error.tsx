"use client";

import { useEffect } from "react";
import Link from "next/link";

// Error boundaries must be Client Components — a hard Next requirement, since
// the boundary attaches on the client.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production Next strips the message and sends only a digest, because
    // error text leaks schema and file paths. So log it and show the digest.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted">
        The equipment data could not be loaded. This is usually temporary.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">Ref: {error.digest}</p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {/* reset() re-renders the segment — a real retry, not a page reload. */}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          Try again
        </button>

        <Link
          href="/"
          className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
