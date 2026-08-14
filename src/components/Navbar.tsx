"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// usePathname is a hook, so this needs a client runtime. It is used only to
// hide the Add button on the page that button leads to.
export default function Navbar() {
  const pathname = usePathname();
  const onCreatePage = pathname === "/items/new";

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className={`flex items-center gap-2.5 rounded-md ${focus}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            Equipment Tracker
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!onCreatePage && (
            <Link
              href="/items/new"
              className={`inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
            >
              Add Equipment
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
