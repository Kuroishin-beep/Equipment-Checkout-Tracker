# Equipment Checkout Tracker

A dashboard for managing company equipment loans. Built for the CRUD.IT Solutions developer exam.

**Live:** https://your-app.vercel.app

## What it does

- Dashboard listing all equipment with colour-coded status badges
- Summary tiles: total, and a count per status
- Filter by status
- Search by item name or assigned person
- Sort by checkout date, condition, or name
- Add, edit and delete items
- Confirmation dialog before deleting
- Toast notifications on create, edit and delete
- Dark mode toggle, with no flash of the wrong theme on load
- Two empty states: "nothing exists yet" and "nothing matches this filter"
- Works on mobile, checked at 375px
- Consistent navigation on every page, including the 404

Search, filter and sort all live in the URL, so they compose — searching while filtered
keeps the filter, and the result is a link you can share.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon (serverless Postgres) |
| DB driver | `@neondatabase/serverless` |
| Validation | Zod |
| Hosting | Vercel |

Two runtime dependencies on top of the Next.js starter: the Neon driver and Zod.

## Setup

You need Node 20.9+ and a free Neon account.

**1. Clone and install**

```bash
git clone https://github.com/Kuroishin-beep/Equipment-Checkout-Tracker.git
cd Equipment-Checkout-Tracker
npm install
```

**2. Create a Neon project**

Go to neon.com and make a project. Open the Connect dialog and turn on connection pooling
before you copy the string. The hostname has to contain `-pooler`.

**3. Add your connection string**

```bash
cp .env.example .env.local
```

Then put your string in `.env.local`:

```
DATABASE_URL="postgresql://...-pooler....neon.tech/neondb?sslmode=require"
```

**4. Set up the database**

In the Neon SQL Editor, run `db/schema.sql` first, then `db/seed.sql`. The seed file ends
with a SELECT so you should get 5 rows back.

`db/seed.sql` deletes everything before inserting, so you can re-run it any time to reset
the sample data.

**5. Run it**

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev      # dev server (Turbopack, the default in Next 16)
npm run build    # production build, type-checks the whole project
npm run start    # serve the production build
npm run lint     # ESLint — note that `next build` does NOT lint in Next 16
```

## Project structure

```
db/
  schema.sql            table, constraints, indexes
  seed.sql              5 sample rows, resets the table
src/
  app/
    page.tsx            dashboard
    loading.tsx         skeleton while the query runs
    error.tsx           error boundary
    not-found.tsx       404
    items/new/          create form
    items/[id]/         detail
    items/[id]/edit/    edit form
    api/items/          GET list, POST create
    api/items/[id]/     GET one, PUT, DELETE
  components/           UI components
  lib/
    db.ts               Neon client
    items.ts            all the SQL lives here
    validation.ts       Zod schema
    types.ts            Item type, status and condition unions
    format.ts           date formatting
```

## API

| Method | Path | Returns |
|---|---|---|
| GET | `/api/items` | 200 + array. Takes `?status=` |

The dashboard page additionally reads `?q=` and `?sort=` and passes them to `listItems()`.
| POST | `/api/items` | 201 + `Location` header |
| GET | `/api/items/[id]` | 200, or 404 |
| PUT | `/api/items/[id]` | 200, or 404 |
| DELETE | `/api/items/[id]` | 204, or 404 |

Any other verb gets a 405. Next does that automatically for methods the route file
doesn't export.

Pages read from `lib/items.ts` directly instead of calling the API, because they already
run on the server and going over HTTP to reach a function in the same process is a wasted
round trip. The API is there for the browser, which is what the forms use.

## Why I picked these

**Neon instead of in-memory or a JSON file.** The exam allows all three, but the other two
don't actually persist on Vercel. Each request can hit a different serverless instance,
and the filesystem is read-only outside `/tmp`. An in-memory array works perfectly in
`next dev` and then quietly loses data in production, which is the worst possible way for
this to break.

**Route Handlers instead of Server Actions.** The exam allows either but also asks for
proper HTTP methods. Server Actions are always a POST underneath, so they can't
demonstrate PUT or DELETE. Route Handlers make the verb explicit, and I could test the
whole API with curl before building any UI.

**Raw SQL, no ORM.** Prisma or Drizzle would both work fine. I skipped them because the
exam wants me to explain every line, and `SELECT * FROM items WHERE status = $1` doesn't
need framework vocabulary to defend. The driver's tagged template parameterises every
value, so dropping the ORM doesn't cost me injection safety.

**All SQL in one file.** Pages and route handlers only call functions from `lib/items.ts`.
One place to change a query. It also means storage is swappable: if Neon had been
unreachable on the day, I could have replaced that one file with an array and nothing else
would have changed.

**`DATE` instead of `TIMESTAMPTZ` for the checkout date.** A checkout date has no time on
it. As a timestamp it goes through timezone conversion, and a date near midnight can
render as the previous day somewhere else. `DATE` carries no timezone so it can't drift.
The value stays a `YYYY-MM-DD` string from Postgres all the way to the input field, which
is also exactly what `<input type="date">` reads and writes.

**Validation in two places.** The same Zod schema runs in the browser for instant feedback
and again in the route handler. `/api/items` is a public URL and anyone can curl it, so
the browser isn't a trust boundary. The database has CHECK constraints as a third layer.

**Most of the app is Server Components.** The dashboard, detail page, filter, badges and
stat tiles all render on the server and ship no JavaScript. Only three components use
`"use client"`: the nav (needs `usePathname`), the form (needs state and fetch), and the
delete button (needs a dialog and fetch).

## Responsive

Mobile first — base classes target the phone, `sm:` / `md:` / `lg:` add complexity upward.

The dashboard renders the item list in **two markup shapes** and lets CSS pick: a real
`<table>` above 768px (`hidden md:block`) and stacked cards below (`md:hidden`). A
five-column table genuinely can't work at 375px, and because the switch is pure CSS it
costs no JavaScript and no resize listener.

Every interactive element has a `hover:` state and a `focus-visible:ring-2` ring, so the
app is usable by keyboard.

## What I'd improve

- **Auth.** There isn't any. Anyone with the URL can edit anything. A real version needs
  login and probably roles.
- **Soft delete.** Delete is permanent. A `deleted_at` column plus filtering it out of
  reads would give an undo and an audit trail.
- **Pagination.** `listItems()` returns everything. Fine at 5 rows, not at 5000.
- **Optimistic updates.** The UI currently waits for the server. `useOptimistic` would
  make it feel instant.
- **Tests.** None. The data layer is plain functions so it would be straightforward to
  cover.
- **Search relevance.** `ILIKE '%term%'` can't use an index and doesn't rank results. At
  real scale this wants Postgres full-text search or a trigram index.
- **Toast persistence.** Toasts are in-memory React state. A failed request that also
  navigates would lose its message.

## Notes

Neon's free tier suspends the compute after a few minutes of inactivity. The first request
after a quiet period takes an extra moment while it wakes up. No data is lost, only the
compute pauses.

## Development log

`DEVLOG.md` has a per-phase record of what I asked AI for, what I changed by hand, and
what I rejected. `PLAN.md` is the architecture written before any code.
