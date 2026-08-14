"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/items/new", label: "Add Equipment" },
];

export default function Navbar() {
  const pathname = usePathname();

  // The button is pointless when you're already on the create page, so it
  // hides there. This is the only remaining reason the nav needs usePathname —
  // and therefore the only reason it's still a Client Component.
  const onCreatePage = pathname === "/items/new";

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {/* logo mark from above */}
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Equipment Tracker
          </span>
        </Link>

        {!onCreatePage && (
          <Link
            href="/items/new"
            className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Add Equipment
          </Link>
        )}
      </nav>
    </header>
  );
}