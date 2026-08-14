import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is what shows in the browser tab and in link previews. The scaffold
// left it as "Create Next App".
export const metadata: Metadata = {
  title: "Equipment Checkout Tracker",
  description: "Track company equipment loans, assignments, and condition.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* flex-col + flex-1 on <main> is the sticky-footer pattern: the footer
          sits at the bottom of the viewport on short pages, and below the
          content on long ones. */}
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <Navbar />

        {/* max-w-5xl + mx-auto centres the column and stops lines becoming
            unreadably wide on a large monitor. The px-4/sm:px-6 pair is the
            mobile-first gutter — smaller padding on a phone, more above 640px. */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 text-sm text-slate-500 sm:px-6">
            Equipment Checkout Tracker — CRUD.IT Solutions developer exam
          </div>
        </footer>
      </body>
    </html>
  );
}
