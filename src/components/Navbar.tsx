"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/items/new", label: "Add Equipment" },
];

export default function Navbar() {
  // usePathname is a hook, and hooks only run in Client Components — this is
  // the entire reason for the "use client" directive at the top of this file.
  // Without the active-link highlight, this could have stayed a Server
  // Component and shipped zero JavaScript.
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight text-slate-900 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Equipment Tracker
        </Link>

        <ul className="flex items-center gap-1">
          {LINKS.map((link) => {
            // "/" would match every path with startsWith, so it needs an exact
            // comparison. Everything else uses startsWith so that a child route
            // keeps its parent's link highlighted.
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // aria-current is what tells a screen reader which link is the
                  // current page. Colour alone does not communicate that.
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}