import Link from "next/link";

// At the app root so it renders inside layout.tsx — the 404 keeps the nav and
// footer instead of stranding the user on a bare page.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        That page doesn&apos;t exist, or the equipment record has been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
