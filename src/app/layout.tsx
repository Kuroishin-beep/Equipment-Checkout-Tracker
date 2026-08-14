import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Equipment Checkout Tracker",
  description: "Track company equipment loans, assignments, and condition.",
};

// Runs before first paint so the saved theme applies with no flash of the wrong
// one. Falls back to the OS preference when nothing is stored.
const THEME_SCRIPT = `
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning because the script above edits className before
    // React hydrates.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>

      {/* flex-col on body + flex-1 on main is the sticky footer pattern. */}
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        {/* children come from a Server Component, so wrapping them in this
            client provider does not make them client components. */}
        <ToastProvider>
          <Navbar />

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>

          <footer className="border-t border-line bg-surface">
            <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm text-muted sm:px-6">
              Equipment Checkout Tracker — CRUD.IT Solutions developer exam
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
