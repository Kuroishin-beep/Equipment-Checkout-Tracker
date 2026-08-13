# Equipment Checkout Tracker — Build Plan

> CRUD.IT Solutions Inc. Developer Coding Exam
> Planning document. No application code has been written yet.
> Last updated: 2026-08-14

---

## 1. Scope

A dashboard that manages company equipment loans. One resource: **Equipment Item**. Full CRUD over it, deployed to Vercel.

### In scope (all required by the exam)

| # | Feature | Route |
|---|---------|-------|
| 1 | Dashboard — list all equipment, status badges, filter by status, empty state | `/` |
| 2 | Create — form with validation, date picker, redirect on success | `/items/new` |
| 3 | Detail — full item info with Edit and Delete buttons | `/items/[id]` |
| 4 | Edit — pre-filled form, save and redirect | `/items/[id]/edit` |
| 5 | Delete — confirmation dialog before deleting | (on detail page) |
| 6 | Responsive — desktop + mobile (tested at 375px), Tailwind | all |
| 7 | Navigation — consistent nav across all pages | all |

### Deliberately out of scope

Kept out so the build stays simple and inside the exam's stated tech expectations:

- Authentication / users / roles — the exam never asks for it
- An ORM (Prisma, Drizzle) — raw parameterised SQL is smaller and easier to defend line-by-line
- A component library (shadcn/ui, MUI) — the exam asks for Tailwind specifically
- A client state library (Redux, Zustand) — the URL and the server hold all state
- File uploads, image handling, CSV export, audit log, pagination
- Multiple resources (categories, employees, locations) — one table only

### Bonus features (only after all 7 required features are done and committed)

Ordered by effort-to-value. Stop wherever time runs out; each is independent.

1. Dashboard summary stats (total / checked out / under repair)
2. Search by item name or assigned person
3. Sort by checkout date or condition
4. Toast notifications on create / update / delete
5. Dark mode toggle

---

## 2. Tech stack and why

| Layer | Choice | Version | Why this |
|-------|--------|---------|----------|
| Framework | Next.js, App Router | 16.x | Exam requires "Next.js 14+ with App Router". 16 is the current stable release from `create-next-app@latest`. |
| Language | TypeScript | 5.x | `create-next-app` default. The Status/Condition unions become compile-time-checked, which prevents a whole class of typo bugs in badge colours and filters. |
| Styling | Tailwind CSS | 4.x | Exam requires it. v4 ships with `create-next-app` and configures itself through `globals.css` — no `tailwind.config.js` needed. |
| Database | Neon (serverless Postgres) | — | See §6. |
| DB driver | `@neondatabase/serverless` | 1.x | Talks to Neon over HTTP instead of a raw TCP socket, which is the correct model for Vercel's serverless functions. Its tagged-template `sql` helper parameterises every value, so SQL injection is closed by default. |
| Validation | Zod | 4.x | One schema object validates the browser form **and** the API route. Without it the two would drift apart. |
| Hosting | Vercel | — | Exam requires it. Same vendor as Next.js, so zero build config. |

**Total runtime dependencies added beyond the Next.js starter: two** (`@neondatabase/serverless`, `zod`).

---

## 3. Build order

The exam explicitly advises "Deploy to Vercel first, even with just the default template" and asks for "8–10 meaningful commits". These phases are sized so each one ends in exactly one commit that leaves the app working.

| Phase | Work | Commit message | Why this order |
|-------|------|----------------|----------------|
| **0** | This plan + DEVLOG scaffold | `docs: add build plan and devlog` | Written before any code so the architecture is a decision, not an accident. |
| **1** | `create-next-app`, push to GitHub, import to Vercel, confirm the live URL loads | `chore: scaffold next.js app with tailwind` | **Deployment is the riskiest step, so it goes first.** Finding a build failure on day one is cheap; finding it an hour before submission is not. |
| **2** | Create Neon project, run `db/schema.sql`, seed 5 rows, set `DATABASE_URL` locally and in Vercel | `feat: add postgres schema and seed data` | The data has to exist before anything can read it. |
| **3** | `lib/types.ts`, `lib/validation.ts`, `lib/db.ts`, `lib/items.ts` | `feat: add data access layer and validation schema` | Every later phase depends on these five functions. Build the foundation once. |
| **4** | Route Handlers: `/api/items` and `/api/items/[id]` | `feat: add REST api route handlers for items` | **API before UI.** Testable with `curl` before a single pixel exists, so a UI bug can never be confused with a data bug. |
| **5** | `layout.tsx`, `Navbar`, `globals.css` theme tokens | `feat: add root layout and navigation` | Gives every following page a frame to sit in. |
| **6** | Dashboard `/` — `ItemTable`, `StatusBadge`, `EmptyState` | `feat: add dashboard with equipment list` | First visible feature. |
| **7** | Status filter on the dashboard | `feat: add status filter to dashboard` | Small, self-contained addition to a page that already works. |
| **8** | Create page `/items/new` — `ItemForm` | `feat: add create item form with validation` | Now items can be added through the UI instead of SQL. |
| **9** | Detail page `/items/[id]` + 404 handling | `feat: add item detail page` | |
| **10** | Edit page `/items/[id]/edit` — reuses `ItemForm` | `feat: add edit item page` | Deliberately after Create so the form component is reused, not rewritten. |
| **11** | Delete + confirmation dialog | `feat: add delete with confirmation dialog` | Destructive action goes last of the CRUD set. |
| **12** | Responsive pass at 375px, hover/focus states, `loading.tsx`, `error.tsx` | `style: responsive layout and interaction states` | Polish once, across all pages, rather than guessing per page. |
| **13** | `README.md` (setup, tech choices, improvements) | `docs: add readme with setup and tech choices` | |
| **14+** | Bonus features, one commit each | `feat: add dashboard summary stats` etc. | |

**14 commits minimum, comfortably above the 8–10 asked for.** Every commit leaves `main` deployable.

---

## 4. File map

```
Equipment-Checkout-Tracker/
├── PLAN.md                          ← this file
├── DEVLOG.md                        ← AI-assisted development log (bonus)
├── README.md                        ← setup / tech choices / improvements (REQUIRED)
├── .env.local                       ← DATABASE_URL — gitignored, never committed
├── .env.example                     ← committed template showing the variable name only
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs               ← Tailwind v4 plugin
│
├── db/
│   └── schema.sql                   ← CREATE TABLE + indexes + 5 seed rows.
│                                       Run once by hand in the Neon SQL Editor.
│
└── src/
    ├── app/
    │   ├── layout.tsx               ← SERVER · root shell: <html>, fonts, <Navbar/>
    │   ├── globals.css              ← Tailwind import + colour tokens
    │   ├── page.tsx                 ← SERVER · DASHBOARD (/)
    │   ├── loading.tsx              ← SERVER · skeleton while the dashboard query runs
    │   ├── error.tsx                ← CLIENT · error boundary (Next requires client here)
    │   ├── not-found.tsx            ← SERVER · 404 page
    │   │
    │   ├── items/
    │   │   ├── new/
    │   │   │   └── page.tsx         ← SERVER · wrapper that renders <ItemForm mode="create">
    │   │   └── [id]/
    │   │       ├── page.tsx         ← SERVER · DETAIL, calls notFound() on a missing id
    │   │       └── edit/
    │   │           └── page.tsx     ← SERVER · loads the item, passes it into <ItemForm mode="edit">
    │   │
    │   └── api/
    │       └── items/
    │           ├── route.ts         ← GET (list + filter + search + sort), POST (create)
    │           └── [id]/
    │               └── route.ts     ← GET (one), PUT (update), DELETE (remove)
    │
    ├── components/
    │   ├── Navbar.tsx               ← CLIENT · usePathname() to highlight the active link
    │   ├── ItemForm.tsx             ← CLIENT · shared by create + edit. useState, fetch, useRouter
    │   ├── ItemTable.tsx            ← SERVER · table on desktop, stacked cards on mobile
    │   ├── StatusBadge.tsx          ← SERVER · maps the 4 statuses to colours
    │   ├── ConditionBadge.tsx       ← SERVER · maps the 4 conditions to colours
    │   ├── FilterBar.tsx            ← CLIENT · writes the filter into the URL query string
    │   ├── DeleteButton.tsx         ← CLIENT · confirm dialog, then DELETE fetch
    │   ├── EmptyState.tsx           ← SERVER · "no equipment yet" + link to /items/new
    │   └── StatsCards.tsx           ← SERVER · bonus, summary tiles
    │
    └── lib/
        ├── db.ts                    ← creates the Neon sql client once
        ├── items.ts                 ← DATA ACCESS LAYER — the only file containing SQL
        ├── validation.ts            ← Zod schema, shared by the form and the API
        └── types.ts                 ← Item type, Status / Condition string unions
```

**~28 files.** The important structural rule: **all SQL lives in `lib/items.ts` and nowhere else.** Pages and route handlers call functions like `listItems()` or `updateItem()`. If a query needs changing there is exactly one place to change it.

---

## 5. Data model

Field names come straight from the exam table. Database columns use `snake_case` (Postgres convention); the TypeScript layer maps them to `camelCase`.

| Exam field | Column | Type | Required | Notes |
|-----------|--------|------|----------|-------|
| — | `id` | `UUID` | auto | Primary key, `gen_random_uuid()`. Unguessable, and safe in a URL. |
| Item Name | `item_name` | `TEXT` | Yes | Non-empty after trimming |
| Assigned To | `assigned_to` | `TEXT` | Yes | Non-empty after trimming |
| Status | `status` | `TEXT` + CHECK | Yes | `Available` / `Checked Out` / `Under Repair` / `Retired` |
| Condition | `condition` | `TEXT` + CHECK | Yes | `New` / `Good` / `Fair` / `Poor` |
| Checkout Date | `checkout_date` | `DATE` | Yes | Calendar date only |
| Notes | `notes` | `TEXT` | No | Nullable |
| — | `created_at` | `TIMESTAMPTZ` | auto | `DEFAULT now()` |
| — | `updated_at` | `TIMESTAMPTZ` | auto | Set to `now()` on every UPDATE |

### `db/schema.sql` (to be written in Phase 2)

```sql
CREATE TABLE IF NOT EXISTS items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name     TEXT NOT NULL CHECK (length(trim(item_name))  > 0),
  assigned_to   TEXT NOT NULL CHECK (length(trim(assigned_to)) > 0),
  status        TEXT NOT NULL CHECK (status    IN ('Available','Checked Out','Under Repair','Retired')),
  condition     TEXT NOT NULL CHECK (condition IN ('New','Good','Fair','Poor')),
  checkout_date DATE NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_status_idx        ON items (status);
CREATE INDEX IF NOT EXISTS items_checkout_date_idx ON items (checkout_date DESC);
```

### Three schema decisions worth being able to defend

1. **`DATE`, not `TIMESTAMPTZ`, for `checkout_date`.** A checkout date has no time component. Storing it as a timestamp introduces timezone conversion, and a date near midnight can render as the previous day for a user in another timezone. `DATE` has no timezone, so it cannot drift.
2. **`TEXT` + `CHECK`, not a Postgres `ENUM` type.** Both reject bad values. A `CHECK` constraint is one `ALTER TABLE` to change; a native `ENUM` is more painful to reorder or remove values from. For four fixed values that might get a fifth later, `CHECK` is the lower-regret choice.
3. **`updated_at` set inside the UPDATE statement, not by a trigger.** One less piece of hidden database behaviour to explain. The single `UPDATE` in `lib/items.ts` always sets it.

---

## 6. Database and data retention

### Can Neon be used here? — Yes, and it is the right choice

The exam says *"Use whatever you're comfortable with — in-memory state, JSON file, or a real DB"* and lists *"Supabase or any real database integration"* as a bonus. Neon is a real database (managed Postgres), so it satisfies the requirement and earns the bonus.

It suits this project specifically because:

- **It is plain Postgres.** No proprietary query language. `SELECT * FROM items WHERE status = $1` is explainable in a walkthrough with no framework vocabulary.
- **It was built for serverless hosts.** Neon separates storage from compute and provides an HTTP driver, which is exactly what Vercel's functions need (see below).
- **It integrates with Vercel directly** through the Vercel Marketplace — Vercel Postgres is itself powered by Neon — so `DATABASE_URL` can be provisioned into the project without copy-pasting secrets.
- **Free tier is enough.** This app stores tens of rows.
- **Database branching.** A `dev` branch can be forked off `main` in seconds so local development never writes to the data the graders will look at.

### Why "retention" is the deciding factor

"Retention" here means: **does the data still exist the next time someone asks for it?** On Vercel, the three storage options the exam offers behave very differently.

| Approach | Survives the next request? | Survives a redeploy? | Verdict |
|----------|---------------------------|----------------------|---------|
| In-memory array (a module-level `let items = []`) | **No** | No | Works in `next dev`, silently breaks in production |
| Writing a JSON file on disk | **No** | No | Throws in production |
| Neon Postgres | **Yes** | **Yes** | Correct |

**Why in-memory fails on Vercel.** Locally, `next dev` is one long-lived Node process, so a module-level array persists and everything looks fine. In production each request is handled by a serverless function instance that Vercel may create, freeze, or destroy at any time, and it runs several instances in parallel under load. A write handled by instance A is invisible to instance B, and when the instance is recycled the array is gone. The result is an app that appears to work in testing and randomly loses data in the demo.

**Why a JSON file fails on Vercel.** The deployment bundle is read-only. The only writable path is `/tmp`, which is local to a single function instance and wiped when that instance is recycled — so it has exactly the same two problems as the in-memory array, plus a crash if the write path is wrong.

**Why Postgres works.** The database is a separate, always-there service. Every function instance connects to the same one, so there is a single source of truth, and redeploying the application does not touch it.

### Connecting correctly from Vercel

- Use the **pooled** connection string from the Neon dashboard — the host contains `-pooler`. Neon runs PgBouncer in front of the database, so hundreds of short-lived function instances do not exhaust the connection limit.
- Use `@neondatabase/serverless`'s `neon()` HTTP driver rather than `pg` over a raw TCP socket. Each query is one HTTP request, so there is no connection to open, hold, or leak on a platform that can freeze a process mid-execution.
- `DATABASE_URL` goes in `.env.local` (gitignored) locally and in **Vercel → Settings → Environment Variables** for **all three** environments — Production, Preview, and Development. Missing it on Preview is the usual cause of "works on prod, 500s on the PR preview".
- Every value goes through the tagged template — ``sql`SELECT * FROM items WHERE id = ${id}` ``. That is not string interpolation: the driver sends the query and the value separately, so a malicious `id` can never become SQL. **No query is ever built with `+` or `${}` inside a plain string.**

### Backup and recovery

- **Point-in-time restore.** Neon keeps a history window and can restore a branch to any moment inside it, which covers the "I just ran the wrong DELETE" case. The window is short on the Free plan and longer on paid plans — the current numbers should be confirmed in Neon's pricing docs before relying on them.
- **Soft delete** is the application-level alternative: add `deleted_at TIMESTAMPTZ`, have DELETE set it instead of removing the row, and filter `WHERE deleted_at IS NULL` in every read. This gives an undo and an audit trail. **Not being built** — the exam asks for a real delete — but it belongs in the README's "what I'd improve" section.

### One behaviour to document in the README

Neon's free compute **auto-suspends after a few minutes of inactivity**. The first request after a quiet period pays a short cold-start while the compute resumes. **No data is lost** — only the compute is paused, the storage is untouched. Worth a line in the README so a grader opening the link after a long gap understands the first load.

### Fallback if Neon cannot be provisioned

If sign-up fails on exam day, drop `lib/db.ts` and back `lib/items.ts` with an in-memory array pre-loaded with 5 sample items — which the exam explicitly permits. **Nothing else in the app changes**, because pages and route handlers only ever call `listItems()` / `getItem()` / `createItem()` / `updateItem()` / `deleteItem()`. That is the practical reason for the data access layer: the storage engine is swappable in one file.

---

## 7. HTTP API — methods and semantics

The exam asks for *"Server Actions or Route Handlers for CRUD. Proper HTTP methods."*

**Choice: Route Handlers.** Server Actions are always an HTTP `POST` under the hood regardless of what they do, so they cannot demonstrate "proper HTTP methods". Route Handlers make the verb explicit, give a real REST surface that can be tested with `curl` independently of the UI, and are the honest answer to "which method does your delete use?".

### How reads and writes flow

Two different paths, on purpose:

- **Reads (page loads)** — Server Components call `lib/items.ts` **directly**. A server calling its own HTTP API is a pointless network round trip; the page and the database layer are already in the same process.
- **Writes (form submissions)** — Client Components `fetch()` the Route Handlers with the correct verb.

Both paths go through the same functions in `lib/items.ts`, so there is one implementation of every query.

### The endpoints

| Method | Path | Purpose | Success | Failure | Safe | Idempotent |
|--------|------|---------|---------|---------|:----:|:----------:|
| `GET` | `/api/items` | List; supports `?status=`, `?q=`, `?sort=` | `200` + JSON array | `500` | ✅ | ✅ |
| `POST` | `/api/items` | Create one | `201` + `Location: /api/items/{id}` + the new item | `400` field errors | ❌ | ❌ |
| `GET` | `/api/items/[id]` | Read one | `200` + JSON object | `404` | ✅ | ✅ |
| `PUT` | `/api/items/[id]` | Replace one | `200` + updated item | `400`, `404` | ❌ | ✅ |
| `DELETE` | `/api/items/[id]` | Remove one | `204` no body | `404` | ❌ | ✅ |

### The two properties behind that table

- **Safe** = does not change server state. Only `GET`. This is why a Delete is a `<button>` firing a `fetch`, never an `<a href>` — browsers and link prefetchers follow links speculatively, and a "safe" method that deletes rows will eventually delete rows nobody clicked.
- **Idempotent** = running it five times leaves the same result as running it once. `GET`, `PUT` and `DELETE` are; `POST` is not. Two `POST`s create two items — which is exactly why the create form disables its submit button while a request is in flight.

### Why each status code

| Code | Used when | Reasoning |
|------|-----------|-----------|
| `200 OK` | GET and PUT succeeded | Standard success with a body |
| `201 Created` | POST succeeded | More precise than 200; the `Location` header tells the client the new resource's URL |
| `204 No Content` | DELETE succeeded | The row is gone, so there is nothing meaningful to return. A body would be noise. |
| `400 Bad Request` | Zod rejected the payload | Response body carries per-field messages so the form can highlight the offending inputs |
| `404 Not Found` | The `id` matches no row | Applies to GET, PUT and DELETE on a missing id |
| `405 Method Not Allowed` | e.g. `PATCH /api/items/[id]` | Free — Next.js returns it automatically for any verb the route file does not export |
| `500 Internal Server Error` | Database or unexpected failure | Log the real error server-side, return a generic message to the client |

### `PUT` rather than `PATCH`

`PUT` replaces the entire resource; `PATCH` applies a partial change. The edit form submits **every** field on every save, so the request genuinely is a full replacement — `PUT` is the accurate verb. `PATCH` would be correct for a partial change such as a status-only dropdown on the dashboard, and is noted as a bonus.

### Three Next.js mechanics this relies on

1. **A Route Handler exports one function per verb.** `export async function GET(request)`, `export async function POST(request)`, and so on in `app/api/items/route.ts`. Verbs that are not exported get an automatic `405`.
2. **Dynamic route params are a Promise.** In Next 15+ the signature is `{ params }: { params: Promise<{ id: string }> }` and it must be awaited: `const { id } = await params`. Forgetting the `await` yields a "params should be awaited" error — a known upgrade trap.
3. **Mutations must invalidate the cached pages.** After a successful write the handler calls `revalidatePath('/')` and `revalidatePath('/items/' + id)`, otherwise the server-rendered dashboard can keep serving the pre-edit HTML. The client then calls `router.refresh()` to pull the fresh render.

### Why the form has to be a Client Component — an HTTP reason

An HTML `<form>` can only send `GET` or `POST`. `PUT` and `DELETE` are not available to it. To use the correct verb the request must come from JavaScript via `fetch(url, { method: 'PUT' })`, and running JavaScript on an event handler requires `"use client"`. The HTTP requirement and the `"use client"` requirement are the same decision.

### Testing the API before any UI exists (end of Phase 4)

```bash
curl -i http://localhost:3000/api/items
curl -i -X POST http://localhost:3000/api/items -H 'Content-Type: application/json' -d '{"itemName":"Dell XPS 15","assignedTo":"Bryan Dale","status":"Checked Out","condition":"Good","checkoutDate":"2026-08-14","notes":"Loaner"}'
curl -i -X PUT http://localhost:3000/api/items/<id> -H 'Content-Type: application/json' -d '{"itemName":"Dell XPS 15","assignedTo":"Bryan Dale","status":"Available","condition":"Good","checkoutDate":"2026-08-14","notes":""}'
curl -i -X DELETE http://localhost:3000/api/items/<id>
curl -i -X POST http://localhost:3000/api/items -H 'Content-Type: application/json' -d '{"itemName":""}'   # expect 400
curl -i http://localhost:3000/api/items/00000000-0000-0000-0000-000000000000                              # expect 404
```

---

## 8. Server vs Client Components

The exam calls this out: *"Know when to use `use client`."*

**The rule:** a component needs `"use client"` only if it uses React state, effects, browser APIs, or DOM event handlers. Everything else stays a Server Component. Push the directive **as far down the tree as possible** — marking a page as client makes every component inside it client too, and ships JavaScript the user did not need.

| Component | Type | Reason |
|-----------|------|--------|
| `app/layout.tsx` | Server | Static shell |
| `app/page.tsx` (dashboard) | Server | `await listItems()` runs on the server; no state |
| `app/items/[id]/page.tsx` | Server | `await getItem(id)`; `notFound()` when null |
| `app/items/[id]/edit/page.tsx` | Server | Loads the item, then hands it to the client form as a prop |
| `ItemTable`, `StatusBadge`, `ConditionBadge`, `EmptyState`, `StatsCards` | Server | Pure presentation from props |
| `ItemForm` | **Client** | `useState` for values and errors, `onSubmit`, `fetch`, `useRouter().push()` |
| `DeleteButton` | **Client** | `useState` for the dialog, `onClick`, `fetch`, `useRouter()` |
| `FilterBar` | **Client** | `useRouter` + `useSearchParams` to write the filter into the URL |
| `Navbar` | **Client** | `usePathname()` to highlight the active link |
| `app/error.tsx` | **Client** | Next.js requires error boundaries to be Client Components |

Net effect: the dashboard's data fetching, table markup and badges ship **zero** client JavaScript. Only the filter bar and the buttons are interactive.

### Why the filter lives in the URL, not in `useState`

`/?status=Checked+Out` is shareable, survives a refresh and a back-button press, and lets the **server** do the filtering in SQL (`WHERE status = $1`) instead of shipping every row to the browser to be hidden with CSS. `useState` would lose the filter on reload and force the list to be a Client Component.

---

## 9. Validation

One Zod schema in `lib/validation.ts` is the single source of truth, used in three places:

1. **Client, on submit** — instant inline field errors, no network round trip. This is the exam's stated minimum.
2. **Server, in the Route Handler** — re-validated before touching the database. The API is a public URL; anyone can `curl` it. **Client-side validation is a convenience for honest users, never a security control.**
3. **Database `CHECK` constraints** — the last line of defence, so a bad row cannot exist even if both layers above are bypassed.

| Field | Rule |
|-------|------|
| `itemName` | required, trimmed, 1–120 characters |
| `assignedTo` | required, trimmed, 1–120 characters |
| `status` | must be one of the four allowed values |
| `condition` | must be one of the four allowed values |
| `checkoutDate` | required, parses as a real calendar date |
| `notes` | optional, max 1000 characters |

The `Item` TypeScript type is inferred from the schema (`z.infer`), so the type and the validation rules cannot drift apart.

---

## 10. UI and responsive plan

**Mobile first.** Base classes target the 375px phone; `sm:` / `md:` / `lg:` prefixes add complexity upward. This is the direction Tailwind is designed for and avoids a pile of override rules.

| Area | Mobile (< 768px) | Desktop (≥ 768px) |
|------|------------------|-------------------|
| Dashboard list | Stacked cards — `md:hidden` | Table — `hidden md:block` |
| Form fields | One column | Two columns — `sm:grid-cols-2` |
| Nav | Compact inline links | Full horizontal bar |
| Stats (bonus) | `grid-cols-2` | `md:grid-cols-4` |

The dashboard renders **the same data twice** in two markup shapes, with one hidden by a breakpoint. A table is genuinely unusable at 375px, and CSS-only visibility switching keeps it a Server Component with no JavaScript.

**Status badge colours** — a fixed map, so the same status is always the same colour:

| Status | Colour |
|--------|--------|
| Available | green |
| Checked Out | blue |
| Under Repair | amber |
| Retired | grey |

**Interaction states** (the exam asks for hover/focus explicitly): every button and link gets a `hover:` style and a `focus-visible:ring-2 focus-visible:ring-offset-2` ring, so the app is usable by keyboard. Disabled submit buttons get `disabled:opacity-50 disabled:cursor-not-allowed`.

---

## 11. Known risks

| Risk | Mitigation |
|------|-----------|
| Vercel build fails late in the build | Phase 1 deploys the empty template before any feature is written |
| `DATABASE_URL` missing on Vercel Preview | Set the variable for Production, Preview **and** Development at the same time in Phase 2 |
| Date shifts by one day across timezones | Column is `DATE`, not `TIMESTAMPTZ`; the value is handled as a `YYYY-MM-DD` string end to end |
| `params` not awaited in Next 15+ | Every dynamic page and route handler destructures with `const { id } = await params` |
| Dashboard shows stale data after an edit | `revalidatePath()` in the handler + `router.refresh()` on the client |
| Neon cold start on first load after idle | Documented in the README; no fix needed |
| One giant commit at the end | Phase table in §3 defines the commit boundaries up front |

---

## 12. Definition of done

**Required — must all be true before any bonus work begins:**

- [ ] `/` lists all equipment with status badges
- [ ] `/` filters by status
- [ ] `/` shows an empty state when there is no data
- [ ] `/items/new` validates, has a date picker, redirects on success
- [ ] `/items/[id]` shows every field with working Edit and Delete buttons
- [ ] `/items/[id]/edit` is pre-filled, saves, and redirects
- [ ] Delete asks for confirmation first
- [ ] Every page is usable at 375px width
- [ ] Nav is present and consistent on every page
- [ ] `GET` / `POST` / `PUT` / `DELETE` all return the correct status codes
- [ ] `README.md` covers setup, tech choices, and what I'd improve
- [ ] 8+ meaningful commits with descriptive messages
- [ ] The live Vercel URL works and its data persists across a redeploy

**Then, and only then:** the bonus list in §1.
