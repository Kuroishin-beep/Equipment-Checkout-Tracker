import Link from "next/link";

// Rendered whenever notFound() is called anywhere in the app, and for any URL
// that matches no route at all. Because it lives at the app root it inherits
// layout.tsx — so the nav and footer are still there and the user is not
// stranded on a bare error page.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <p className="text-sm font-medium text-slate-400">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        That page doesn’t exist, or the equipment record has been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  );
}