// Next wraps the segment in a Suspense boundary and uses this as the fallback.
// Creating the file is the whole wiring — there is no isLoading flag anywhere.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div>
        <div className="h-7 w-36 rounded bg-line" />
        <div className="mt-2 h-4 w-28 rounded bg-line" />
      </div>

      {/* Index keys are fine here: fixed length, never reorders. */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl border border-line bg-surface" />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-line" />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <div className="h-4 w-1/3 rounded bg-line" />
            <div className="mt-2 h-3 w-1/4 rounded bg-line" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading equipment…</span>
    </div>
  );
}
