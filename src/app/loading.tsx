// Rendered automatically while an async Server Component in this segment is
// awaiting. Next wraps the segment in a Suspense boundary and uses this file as
// the fallback — there is no isLoading flag, no useState, and no code in the
// page itself. Creating the file is the entire wiring.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="h-7 w-36 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-36 rounded-md bg-slate-200" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-slate-200" />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* The shimmer communicates nothing to a screen reader. */}
      <span className="sr-only">Loading equipment…</span>
    </div>
  );
}