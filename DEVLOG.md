# DEVLOG — AI-Assisted Development Log

Equipment Checkout Tracker · CRUD.IT Solutions Inc. Developer Coding Exam

The exam allows AI tools but I have to be able to explain every line. So this log records what I
asked for, what I kept, what I threw out, and what I changed myself.

**Each entry:** what I was doing, what I asked, what came back, what I changed and why.

---

## Tools used

| Tool | Used for |
|------|----------|
| Claude Code (Opus 5) | Architecture planning, written step-by-step instructions, code review, drafting this log |
| Neon SQL Editor | Running the schema and inspecting rows directly |
| Chrome DevTools (device toolbar, 375px) | Responsive verification |
| `curl` | Testing the REST endpoints before any UI existed |

---

## 2026-08-14 — Phase 0 · Planning

**Goal:** Turn the exam PDF into an actual architecture before writing any code.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> Scan this PDF, and plan/map out the bases first before continuing. What steps should be
> done first and then map out the files needed for the full webapp to work. Do not go out of
> scope — just create a simple dashboard that manages company equipment loans. Tell me what
> database should be used or how we will keep the retention, as well as the HTTP methods that
> will be implemented and how. Do not code anything at first and keep a DEVLOG.md.
> Can a Neon DB be used here? Stay within the scope of tech expectations.

**What came back:** [`PLAN.md`](PLAN.md). Scope boundary, stack table, a 14-phase build order
mapped to commits, the full file map with Server/Client marked per file, the SQL schema, the
persistence analysis, and the HTTP method contract.

**Decisions I made, and why:**

1. **Route Handlers, not Server Actions.** The exam allows either but also says "proper HTTP
   methods". Server Actions are always a POST underneath, so they can't show PUT or DELETE. Route
   Handlers make the verb explicit and I can test them with curl before any UI exists.

2. **Neon Postgres, not in-memory or a JSON file.** The exam permits all three but the other two
   don't actually persist on Vercel. Each request can hit a different serverless instance, and the
   filesystem is read-only outside `/tmp`. An in-memory array works perfectly in `next dev` and
   then loses data in production, which is the worst way for this to fail. Written up in
   `PLAN.md` §6.

3. **Raw parameterised SQL, no ORM.** Prisma and Drizzle would both work. The exam's bar is
   "explain every line", and `SELECT * FROM items WHERE status = $1` needs no framework vocabulary
   to defend. The tagged-template driver parameterises values anyway, so skipping the ORM doesn't
   cost me injection safety.

4. **All SQL in `lib/items.ts`.** Pages and route handlers only call named functions. It's also my
   escape hatch: if Neon couldn't be provisioned on the day, one file gets swapped for an array
   and nothing else changes.

5. **API before UI (Phase 4 before Phase 6).** If the endpoints are already verified with curl,
   any bug I find while building a page is a UI bug by elimination.

6. **Deploy the empty template first (Phase 1).** Straight from the exam's own tips. A build
   failure is cheap on day one and expensive an hour before submission.

**What I cut from scope:** an ORM, a component library, auth, pagination, multiple tables. None
are asked for and each is more surface area to defend. Listed under "Deliberately out of scope" in
`PLAN.md` §1 so they read as decisions, not gaps.

**Checked, not assumed:** package versions came from the npm registry rather than the model's
memory. Next.js 16.3.0, Tailwind 4.3.3, `@neondatabase/serverless` 1.1.0, Zod 4.4.3.

**Written by hand:** this entry.

**Status:** No application code yet. Next is Phase 1, scaffold and deploy.

---

## 2026-08-14 — Phase 1 · Scaffold and deploy

**Goal:** Get an empty but real Next.js app deployed to Vercel from GitHub before writing any
features, so deployment stops being a submission-day risk.

**Tool:** Claude Code (Opus 5), for an environment check and written instructions only. **I ran
every command myself.** Nothing in commit `4eacfe6` was written by AI. It's `create-next-app`
output plus my own git work.

**Prompt I gave:**
> GIVe me the isntructions on how to do the phase 1 on my own and explain each step of it

**What came back:** An 11-step guide, a table explaining every `create-next-app` flag, a
done-checklist and a troubleshooting table. Three things it checked on my machine rather than
assumed, each of which changed the instructions:

- Node v22.21.1, npm 10.9.4, git 2.46.0. All fine for Next 16, which needs Node 20.9+
- `gh` CLI isn't installed here, so the GitHub and Vercel steps had to be browser-based
- `origin` was already pointed at `github.com/Kuroishin-beep/Equipment-Checkout-Tracker` and the
  repo was empty, so no repo creation and no `git remote add`

It also test-ran `create-next-app` in a throwaway folder containing dummy `PLAN.md` and
`DEVLOG.md` files, which proved in advance that the scaffold would refuse to run here:

> The directory contains files that could conflict: DEVLOG.md, PLAN.md

`create-next-app` only tolerates a known list of pre-existing files (`.git`, `.gitignore`,
`README.md`, `LICENSE`) and my two planning docs aren't on it. That turned a blocker I'd have hit
mid-command into two planned steps.

**What I did by hand — all of it:**

1. Committed the planning docs first → `7d32b2d` (00:52). Doing it first meant they were
   recoverable with `git checkout` before I moved them anywhere.
2. Moved `PLAN.md` and `DEVLOG.md` up to `E:/Github/` so the folder held only `.git/`
3. Ran the scaffold:
   `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes`
4. Moved both docs back
5. Read `.gitignore` and confirmed `node_modules` and `.env*` were covered
6. `npm run dev`, loaded localhost:3000, confirmed the starter page, `Ctrl+C`
7. `git add -A`, checked `git status --short` for stray `node_modules` before committing
8. Committed → `4eacfe6` (01:07), 19 files, 7,089 insertions
9. `git push -u origin main`
10. Imported the repo on vercel.com in the browser, confirmed Framework Preset auto-detected
    **Next.js**, left Environment Variables empty since the database is Phase 2, deployed

Fifteen minutes between the two commits. `git reflog` shows no resets, amends or stashes, so it
worked first try.

**Live URL:** <!-- TODO: paste the .vercel.app URL here -->

**Versions actually installed,** from `package.json` rather than what I expected:
`next` 16.3.0 · `react` / `react-dom` 19.2.8 · `tailwindcss` ^4 · `typescript` ^5 · `eslint` ^9

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| <!-- fill in, or write "None — the pre-flight check caught the only blocker before I hit it" --> | | |

**What I can explain:**

Reading the generated files instead of just accepting them turned up five things specific to this
stack version. I checked the first two against the docs shipped in `node_modules/next/dist/docs/`
rather than trusting the AI's memory.

- **`"dev": "next dev"` has no `--turbopack` flag.** On Next 15 the script reads
  `next dev --turbopack`. It's gone in Next 16 because Turbopack became the default, not because
  it was dropped. Webpack is now the opt-in: `next dev --webpack`.
- **`"lint": "eslint"`, not `next lint`.** Next 16 removed the `next lint` command. You call
  ESLint directly, with flat config in `eslint.config.mjs`. The part that actually matters:
  **`next build` no longer runs linting**, so Vercel's build won't fail on a lint error. I have to
  run `npm run lint` myself.
- **There's no `tailwind.config.js`, and that's correct.** Tailwind v4 moved config into CSS.
  `src/app/globals.css` opens with `@import "tailwindcss"` and the build wiring is the
  `@tailwindcss/postcss` plugin in `postcss.config.mjs`. Hunting for the missing config file is
  the classic v3 → v4 mistake.
- **`next-env.d.ts` is on disk but not in the commit** because `.gitignore` line 41 ignores it.
  It's regenerated on every `next dev` / `next build`, so committing it is pure churn.
- **`--disable-git` mattered.** Without it, `create-next-app` can run `git init` and write its own
  commit called "Initial commit from Create Next App". The exam grades commit history, so every
  commit needed to be mine.

**An assumption I checked and dropped.** I first read `AGENTS.md` and `CLAUDE.md` being in the
scaffold commit as proof I'd run `npm run dev` before committing, since `AGENTS.md` says its
contents are "written and re-added by `next dev`". The installation doc says otherwise:
`create-next-app`'s default setup already includes `AGENTS.md` with a `CLAUDE.md` referencing it.
Both files would be in that commit either way, so they prove nothing about timing. Noting it
because the reasoning was wrong even though the conclusion happened to be right.

**Carried into Phase 2:** `.gitignore` line 34 is `.env*`, broader than the `.env*.local` I
expected. It ignores `.env.example` too, so committing that template needs `git add -f`.

**Still open:** `README.md` is still the stock `create-next-app` text. Phase 13 replaces it.

**Commit:** `chore: scaffold next.js 16 app with ts and tailwind` (`4eacfe6`)

---

## 2026-08-14 — Phase 2 · Database, schema, seed

**Goal:** A real Postgres database with a validated `items` table and five sample rows, plus the
`DATABASE_URL` wiring in both places it's needed. No application code. Nothing reads the database
until Phase 3.

**Tool:** Claude Code (Opus 5), for the schema design and the reasoning behind each column type.
I created every file and ran every statement myself.

**Prompts I gave,** in order. The sequence matters more than any single one:
> let's do phase 2
>
> no i should do all of it by me
>
> how do i populate the schema.sql
>
> give em the full schmea and how to do it step by step first
>
> what am i inputting insed .env.example and .env.local

**The process correction is the story of this phase.** The first response wrote `db/schema.sql`,
`db/seed.sql` and `.env.example` straight into the repo. I stopped it. For an exam whose bar is
"explain every line", files I didn't write are files I can't defend. It reverted all three and
switched to teaching the SQL patterns against a throwaway `books` table instead, so I had to map
the constructs onto `items` myself rather than paste.

I then asked for the full schema explicitly, after working through the shape. That's a different
thing from having it written for me unasked, and I want the distinction on record: **I decided
when to look at the answer.**

**What I did by hand:**

- Created `db/` and both `.sql` files
- Worked through `CREATE TABLE` syntax from the pattern examples before asking for the full version
- Ran `db/schema.sql` in the Neon SQL Editor, verified against `information_schema.columns`
- Deliberately ran an INSERT with status `'Borrowed'` to watch the CHECK constraint reject it
- Ran `db/seed.sql`, confirmed the trailing SELECT returned 5 rows
- **Cut `.env.example` down to one line.** The suggested version was a 25-line comment block
  explaining pooling. I kept the variable and the placeholder and dropped the essay. The reasoning
  already lives in `PLAN.md` §6 and duplicating it into a config template just means two places to
  keep in sync. Final file is 109 bytes.
- Created `.env.local`, pasted the real pooled connection string, verified it's gitignored

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**Verification I actually ran:**

| Check | Expected | Result |
|-------|----------|--------|
| `information_schema.columns` for `items` | 9 columns, `notes` the only nullable | |
| INSERT with status `'Borrowed'` | rejected by CHECK constraint | |
| `SELECT count(*) FROM items` after seed | 5 | |
| `git check-ignore -v .env.local` | `.gitignore:34:.env*` | confirmed |
| `.env.example` scanned for real credentials | 0 matches | confirmed |

**What I can explain:**

- **Why `DATE` and not `TIMESTAMPTZ`.** A checkout date has no time on it. As a timestamp it goes
  through timezone conversion, and a value near midnight renders as the previous day for someone
  in another timezone. `DATE` carries no timezone so it can't drift.
- **Why `NOT NULL` isn't enough.** It accepts `"   "` as a valid string. The
  `CHECK (length(trim(item_name)) > 0)` is what rejects it. I proved this by running the bad
  insert instead of assuming.
- **Why `TEXT` + `CHECK` and not a native `ENUM`.** Both reject invalid values. A CHECK is one
  `ALTER TABLE` to change; adding or reordering ENUM values is much more painful. Four statuses
  could plausibly become five.
- **Why the connection string needs `-pooler`.** Vercel runs the app as serverless functions that
  can scale to many concurrent instances. The pooled endpoint puts PgBouncer in front of Postgres
  so short-lived connections don't exhaust the limit. The direct endpoint works fine on localhost
  and then fails under load in production, which is the same class of trap as in-memory storage.
- **Why `.env.example` is committed and `.env.local` isn't.** Same variable name, different
  values. The template documents which variables exist so a fresh clone doesn't crash with a
  cryptic error. The local file holds the real secret and is matched by `.env*` in `.gitignore`.
- **Why Neon and Vercel are both in Singapore.** The latency that matters is function to database,
  not browser to database. Vercel defaults to Washington DC, and leaving that with Neon in
  Singapore sends every query across the Pacific and back.

**Two constraints deliberately duplicated:** `status` and `condition` are validated by CHECK in
the database and again by Zod in Phase 3. That's intentional. Zod gives the user a readable inline
error; the database constraint holds even if someone bypasses the app and writes SQL directly.

**Carried in from Phase 1 and resolved:** the `.gitignore` `.env*` note. `.env.example` was
force-added with `git add -f` while empty in commit `6bf0066`. Because it's now tracked, the
ignore rule no longer applies and this phase's edit staged normally.

**Still open at the end of this phase:**
- The commit isn't pushed yet
- `DATABASE_URL` still needs adding to Vercel for all three environments
- Vercel function region still needs setting to `sin1`
- `README.md` is still stock

**Commit:** `feat: add postgres schema and seed data` (`1270fc9`) — 3 files, 95 insertions

---

## 2026-08-14 — Phase 3 · Data access layer

**Goal:** Four files under `src/lib/` that sit between the database and everything else. After
this phase nothing in the app needs to know SQL exists. Pages and route handlers call five named
functions instead.

**Tool:** Claude Code (Opus 5). I asked for the full file contents this phase, having already had
the architecture explained, and typed and placed them myself.

**Prompts I gave:**
> also explai waht they do
>
> phase 3 with explanation of each

**Something it did that I want on record:** before writing the Zod schema it installed Zod 4.4.3
in a scratch folder and ran a script against it to check the API rather than writing from memory.
That turned up a real behaviour that changed the code. `z.string().trim().optional()` turns
`"   "` into `""`, not `undefined`. So an empty notes box arrives as an empty string, and `""`
isn't the same as `NULL` in a nullable column. That's why `items.ts` has a `normaliseNotes()`
helper collapsing both to `NULL`. It also confirmed `z.iso.date()` exists in Zod 4 and rejects
`2026-02-31`, which a plain regex would accept, so no hand-rolled date check was needed.

**What I did by hand:**

- Ran `npm install @neondatabase/serverless zod`, the only two runtime dependencies this project
  adds on top of the Next.js starter
- Created all four files under `src/lib/`
- Replaced `src/app/page.tsx` with a five-line throwaway that dumps `listItems()` as JSON, to
  prove the whole chain worked before any UI existed
- Checked the three things that matter in that dump: keys are camelCase (the mapper ran),
  `checkoutDate` is a 10-character string with no `T` or `Z` (the `to_char` cast held), and the
  Dell row's `notes` is `null` rather than `""`

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Module not found: Can't resolve '@/lib/items'` | I created the files in `src/app/lib/`. The `@/*` alias in `tsconfig.json` maps to `./src/*`, so `@/lib/items` resolves to `src/lib/items`, one directory higher than where they were | `mv src/app/lib src/lib`, then restarted the dev server. Next caches module resolution so hot reload doesn't pick it up |

I fixed it by moving the folder rather than changing the import to `@/app/lib/items`, which would
also have worked. Everything under `src/app/` is the App Router's routing tree, a data layer isn't
a route, and keeping the tree to routes only is what someone reading the repo expects. It also
keeps the file map in `PLAN.md` §4 honest.

**What I can explain:**

- **Why types and validation aren't redundant.** TypeScript types are erased at compile time.
  `const item: Item = await request.json()` compiles happily and is a lie, because the bytes that
  arrived could be anything. Zod runs at runtime and actually looks at the data. Types catch me
  writing `item.itmeName`; validation catches a stranger POSTing garbage to a public API.
- **Why `${id}` in a `sql` template isn't string interpolation.** `sql` is a tagged template. The
  driver gets the static SQL and the values as separate arguments and sends them separately to
  Postgres, so `${id}` becomes `$1`. A hostile id arrives as a value to compare against, never as
  SQL. That's the whole injection defence, and it's why there's no escaping code in the file.
- **Why `to_char(checkout_date, 'YYYY-MM-DD')` matters.** Postgres drivers commonly parse `DATE`
  columns into JavaScript `Date` objects. A `Date` is a timestamp, so it lands at local midnight
  and can render as the previous day elsewhere, which is exactly the bug the `DATE` column was
  chosen to avoid. Casting back to a string in SQL keeps the guarantee.
- **Why the five return types are the HTTP contract.** `getItem` returns `Item | null` and
  `deleteItem` returns `boolean` so that Phase 4 can map `null` and `false` to 404 and a
  successful delete to 204. Return the wrong thing and the route handler can't tell "missing" from
  "succeeded".
- **Why the status filter is `WHERE (${status}::text IS NULL OR status = ${status})`.** A tagged
  template can't build dynamic SQL, so the condition disables itself. Pass `null` and the first
  half is true, making the clause a no-op. One query serves both cases. The `::text` cast is
  needed because Postgres can't infer a type for a bare NULL parameter.
- **Why `as const` on the `STATUSES` array.** Without it TypeScript widens it to `string[]` and
  `(typeof STATUSES)[number]` degrades to `string`. With it, one array serves as both the runtime
  list I map into dropdown options and the compile-time union type.

**A decision that differs from a naive mapping:** the `Item` type has no `createdAt` or
`updatedAt` even though both columns exist. They're there for stable ordering and future auditing.
Nothing in the UI shows them, so they don't belong in the type the UI consumes. Easy to add if a
bonus feature needs them.

**Housekeeping:** this commit also swept in the Phase 2 DEVLOG entry, which should have been its
own `docs:` commit. Not worth rewriting history over, but the commit is slightly broader than its
message suggests.

**Still open:**
- `2ed70d9` isn't pushed yet
- `DATABASE_URL` still needs adding to Vercel. Phase 3 is the first code that reads it, so from
  here a missing variable means a broken deploy
- The Phase 1 `Live URL` is still a TODO
- `src/app/page.tsx` is still the throwaway JSON dump

**Commit:** `feat: add data access layer and validation schema` (`2ed70d9`) — 8 files,
312 insertions, 71 deletions

---

## 2026-08-14 — Phase 4 · REST API route handlers

**Goal:** Five endpoints over the data layer, with the correct HTTP verb and status code for each.
This is the exam's "proper HTTP methods" requirement, and I can test it with curl before any UI
exists.

**Tool:** Claude Code (Opus 5), full file contents plus the reasoning behind each status code.

**Prompts I gave:**
> DEVLOG and then phase 4
>
> how do i do step 2

**Why Route Handlers and not Server Actions.** The exam allows either. Server Actions are always
an HTTP POST underneath no matter what they do, so they can't demonstrate PUT or DELETE. Route
Handlers make the verb explicit and give me an API I can exercise independently of the browser.

**Three version-specific facts checked against the docs in `node_modules/next/dist/docs/` rather
than assumed:**

- Dynamic params are a `Promise` in Next 15+, `{ params }: { params: Promise<{ id: string }> }`,
  and must be awaited. Confirmed in the `route.md` API reference.
- **Route Handlers are not cached by default** in Next 16. In Next 14 GET handlers were cached by
  default and this would have needed `export const dynamic = "force-dynamic"`. It doesn't, and
  adding it would be cargo-culting from an older version.
- `OPTIONS` is auto-implemented with a correct `Allow` header if I don't define it, and any verb I
  don't export returns 405 for free.

**What I did by hand:**

- Created `src/app/api/items/route.ts` (GET, POST) and `src/app/api/items/[id]/route.ts`
  (GET, PUT, DELETE)
- Created the `[id]` directory. The square brackets are literal characters on disk, not
  placeholder notation
- Ran the full curl suite below against a live dev server

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Endpoint served `/items` instead of `/api/items` | I created the collection route at `src/app/items/route.ts`, missing the `api` path segment | `mkdir -p "src/app/api/items/[id]"`, moved the file, removed the empty folder |

**A pattern I need to watch.** That's the second missing-path-segment mistake in two phases:
`src/app/lib` instead of `src/lib` in Phase 3, `src/app/items` instead of `src/app/api/items`
here. In the App Router the folder path is the URL, so a wrong segment is never cosmetic. This one
was worse than the Phase 3 version, because `src/app/items/` is where the UI pages go in Phases
8–9 and Next doesn't allow `route.ts` and `page.tsx` in the same folder. Leaving it there would
have blocked the item pages later. From here I check the full path against `PLAN.md` §4 before
creating a file, not after the import fails.

**Verification I ran:**

| Request | Expected | Result |
|---------|----------|--------|
| `GET /api/items` | 200, 5 items | |
| `GET /api/items?status=Available` | 200, 2 items | |
| `GET /api/items?status=Banana` | 400 | |
| `POST` valid body | 201 + `Location` header | |
| `POST` invalid body | 400 with per-field `fieldErrors` | |
| `POST` malformed JSON | 400 "must be valid JSON" | |
| `GET /api/items/banana` | 404, not 500 | |
| `GET` valid-but-absent UUID | 404 | |
| `PATCH /api/items/<id>` | 405 + `Allow` header | |
| `PUT /api/items/<id>` | 200 + updated item | |
| `DELETE /api/items/<id>` | 204, no body | |
| Same `DELETE` again | 404 | |

**What I can explain:**

- **Safe vs idempotent.** Safe means no server state changes, so only GET. That's why Delete is a
  `<button>` firing a fetch and never an `<a href>`: browsers and link prefetchers follow links
  speculatively, so a destructive GET eventually deletes rows nobody clicked. Idempotent means
  running it five times leaves the same result as running it once. GET, PUT and DELETE are, POST
  isn't. Two POSTs create two items, which is why the create form disables its submit button while
  a request is in flight.
- **PUT not PATCH.** The edit form submits every field on every save, so the request is a full
  replacement. PATCH would be right for a partial change like a status-only dropdown, which is a
  bonus, not this.
- **Why 204 on delete.** The row is gone, so there's nothing meaningful to return. A body on a 204
  is invalid HTTP, which is why that response uses `new NextResponse(null, ...)` instead of
  `NextResponse.json()`.
- **Why the second DELETE returns 404.** It proves the first one removed something, and that the
  handler can tell "gone" from "never existed". That distinction is the whole reason `deleteItem()`
  returns a boolean instead of void.
- **Why 400 is split in two.** Malformed JSON and failed validation are different failures with
  different messages. Both are the client's fault and neither is a 500.
- **Why 500 responses say nothing useful.** The real error goes to `console.error` server-side.
  Database errors can leak schema details so they never cross the wire.
- **Why validation runs again on the server.** The form validates too, but `/api/items` is a public
  URL and anyone can curl it. Client-side validation is a convenience for honest users, not a
  security control. The browser isn't a trust boundary.
- **Why `getItem` returning `null` for a malformed id matters.** Without the UUID guard in
  `items.ts`, Postgres raises `invalid input syntax for type uuid` and `/api/items/banana` becomes
  a 500 where 404 is correct.

**Housekeeping:** as in Phase 3, this commit swept in the previous phase's DEVLOG entry rather
than giving it its own `docs:` commit.

**Still open:**
- `DATABASE_URL` in Vercel for all three environments, and function region `sin1`
- The Phase 1 `Live URL` is still a TODO
- `src/app/page.tsx` is still the throwaway JSON dump

**Commit:** `feat: add rest api route handlers for items` (`906352c`) — 3 files, 260 insertions.
Everything through Phase 4 is pushed.

---

## 2026-08-14 — Phase 5 · Root layout and navigation

**Goal:** A consistent frame every page sits inside — nav, centred content column, footer — plus
the metadata and font wiring the scaffold left unfinished. The exam requires consistent nav across
all pages, and doing it in the root layout means I can't forget it on a page.

**Tool:** Claude Code (Opus 5). It read my existing `layout.tsx` and `globals.css` before writing
anything rather than assuming what the scaffold produced.

**Prompt I gave:**
> DEVLOG and then phase 5

**A bug it found in the generated scaffold.** `globals.css` line 25 was:

```css
body { font-family: Arial, Helvetica, sans-serif; }
```

`create-next-app` loads the Geist font via `next/font`, exposes it as `--font-geist-sans`, maps it
into Tailwind's theme as `--font-sans`, and then overrides all of that with Arial. The font was
being downloaded on every page load and never rendered. Removing the rule and putting `font-sans`
on `<body>` fixes it. Worth recording because it came from reading the generated code instead of
trusting it, which is the habit the exam is actually testing.

**A decision I want to defend:** I removed the `@media (prefers-color-scheme: dark)` block the
scaffold shipped. The exam lists a dark mode *toggle* as a bonus. What the scaffold provides is
automatic OS-driven dark that only inverts the page background — cards, borders and text stay
light, so it looks broken rather than themed. A clean light theme now with a proper toggle later
is the better trade. It's four lines to put back.

**What I did by hand:**

- Rewrote `globals.css` down to an `@import` and a four-line `@theme inline` block
- Created `src/components/Navbar.tsx`, **at the correct path first time**. After two
  missing-segment mistakes in Phases 3 and 4 I checked against `PLAN.md` §4 before creating the
  folder rather than after the import failed
- Updated `layout.tsx`: real metadata, `<Navbar />`, a `max-w-5xl` content column, sticky footer
- Tabbed through every link to confirm the focus rings actually show
- Checked the nav at 375px

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- **Why `Navbar` is a Client Component but `layout.tsx` isn't.** `usePathname()` is a hook and
  hooks need a client runtime. That's the only reason for the directive. Drop the active-link
  highlight and the whole nav could be a Server Component shipping no JavaScript.
- **`"use client"` marks a boundary downward, not upward.** This is the part people get wrong. A
  Client Component doesn't make its parent client and doesn't make its siblings client.
  `layout.tsx` stays a Server Component and renders `<Navbar />` as a small client island. The
  pages passed in as `children` are unaffected and still render on the server.
- **Why the active-link check special-cases `"/"`.** Every path starts with `/`, so
  `pathname.startsWith("/")` would light up every link at once. The root needs an exact match;
  everything else uses `startsWith` so a child route keeps its parent highlighted.
- **Why `aria-current="page"` is on the active link.** The dark pill communicates the current page
  visually. `aria-current` communicates it to a screen reader. Colour alone isn't an accessible
  signal.
- **What `@theme inline` does in Tailwind v4.** It maps the CSS variables `next/font` sets on
  `<html>` into Tailwind's theme, which is what makes `font-sans` resolve to Geist. `inline`
  matters: without it Tailwind tries to resolve the value at build time, but `next/font` only sets
  it on the element at runtime.
- **The sticky-footer pattern.** `flex flex-col` on `<body>` plus `flex-1` on `<main>` puts the
  footer at the bottom of the viewport on short pages and below the content on long ones, with no
  fixed positioning and no JavaScript.
- **Mobile-first gutters.** `px-4 sm:px-6` reads as 16px of side padding by default, 24px above
  640px. The unprefixed class is the phone case and prefixed classes only ever add. Writing it the
  other way round means fighting your own overrides.

**Known and intentional:** the "Add Equipment" link 404s. `/items/new` isn't built until Phase 8.

**Commit:** `feat: add root layout and navigation` (`31716d6`) — 4 files, 193 insertions,
24 deletions. `globals.css` got smaller, which is the right direction.

---

## 2026-08-14 — Phase 6 · Dashboard

**Goal:** The first required feature. List all equipment with status badges and an empty state
when there's no data. Replaces the throwaway JSON dump from Phase 3.

**Tool:** Claude Code (Opus 5), full file contents with the reasoning inline.

**Prompt I gave:**
> DEVLOG and then phase 6

**What I did by hand:** created `src/lib/format.ts` and four components under `src/components/`,
rewrote `src/app/page.tsx`, then checked it at desktop and 375px.

**The result I'm most pleased with: this phase has no `"use client"` in it at all.** Data
fetching, table markup, badges and date formatting all run on the server and arrive as HTML. The
browser downloads no JavaScript to render the dashboard. I confirmed it with View Source rather
than the DevTools inspector, because the inspector shows the live DOM and looks identical either
way. View Source shows what the server actually sent, and the item names are in it.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**Three traps I designed around rather than discovered the hard way:**

1. **Tailwind can't see class names built at runtime.** It scans source files for complete literal
   strings at build time, so `bg-${colour}-100` generates no CSS at all and the badge renders
   unstyled. Both badge components hold a lookup object of whole class names instead. This is the
   most common Tailwind mistake and it fails silently. Nothing errors, the colour is just missing.
2. **`toLocaleDateString()` without an explicit locale causes a hydration mismatch.** The page
   renders on the server and hydrates on the client. If the two runtimes pick different locales
   they produce different strings and React complains. `formatDate` hard-codes `"en-GB"`.
3. **Formatting the date would have undone the `DATE` column decision.** `new Date("2026-07-28")`
   parses as UTC midnight, so formatting it in a timezone behind UTC prints the 27th. That's the
   Phase 2 bug reintroduced at the last step. `formatDate` pins both the parse (`T00:00:00Z`) and
   the format (`timeZone: "UTC"`) to UTC.

**What I can explain:**

- **Why `Record<Status, string>` and not just an object.** It makes the map exhaustive. Add a
  fifth status to `types.ts` and the badge file stops compiling until that status gets a colour.
  The type system enforces that the UI keeps up with the data model.
- **Why the responsive strategy is two markup shapes rather than one that stretches.**
  `hidden md:block` on the table and `md:hidden` on the card list render the same data twice and
  let CSS choose. Five columns can't work at 375px. Because the switch is pure CSS it costs no
  JavaScript and no resize listener.
- **Why `key={item.id}` and never the array index.** With an index key, deleting a row makes React
  reuse the wrong DOM node for the row that shifts up into its place.
- **Why `<dl>` for the mobile cards.** They're label/value pairs, not a list of items. The markup
  describes the data rather than just the layout. `scope="col"` on the table headers does the same
  job for the desktop view.
- **Why an empty state is worth a component.** A blank page reads as broken. "No equipment yet"
  with a link to the create form reads as working-but-empty and points at the next action.

**A deviation from the plan:** `src/lib/format.ts` isn't in the `PLAN.md` §4 file map. I added it
because the date formatting needed a home and inlining it in `ItemTable` would have meant
duplicating it on the detail page in Phase 9. Small and justified, but worth noting instead of
quietly leaving the plan stale.

**Known and intentional:** item name links 404. `/items/[id]` isn't built until Phase 9.

**Commit:** `feat: add dashboard with equipment list` (`21315be`) — 7 files, 284 insertions

---

## 2026-08-14 — Phase 7 · Status filter

**Goal:** The last required dashboard feature. Small on the surface, and the first place the URL
becomes application state.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> DEVLOG and then Phase 7

**I deliberately went against my own plan here.** `PLAN.md` §4 marks `FilterBar` as a Client
Component using `useRouter` and `useSearchParams`. I built it as a Server Component rendering four
`<Link>` pills instead, because a filter is just navigation and navigation is links.

| | `<select>` + `useRouter` | Pill links |
|---|---|---|
| `"use client"` | required | not needed |
| JavaScript shipped | yes | none |
| Works with JS disabled | no | yes |
| Back button / shareable URL | works | works, by construction |

A `<select>` would earn its place if the filter had to combine with a live search box, which is
the bonus feature. If I get to it, `FilterBar` becomes a Client Component then. For four fixed
statuses, links are simpler. The dashboard is now complete and still ships no client JavaScript.

**Checked rather than assumed, again:** before writing the page signature it read the generated
route types at `.next/dev/types/routes.d.ts` instead of guessing at the helper's shape:

```ts
interface PageProps<AppRoute extends AppRoutes> {
  params: Promise<ParamMap[AppRoute]>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
```

That confirmed `PageProps<"/">` exposes `searchParams` as a Promise of an index signature, so
`searchParams.status` is `string | string[] | undefined`, which is why `parseStatus` handles the
array case.

**What I did by hand:** created `FilterBar.tsx`, rewrote `EmptyState.tsx` to cover two cases, and
updated `page.tsx` to read and validate the query string.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- **Why the filter lives in the URL rather than `useState`.** `/?status=Checked%20Out` can be
  bookmarked and shared, and it survives a refresh and the back button. `useState` would lose it
  on reload and force the item list to become a Client Component, which would mean shipping every
  row to the browser and hiding some with CSS.
- **Why filtering happens in SQL, not JavaScript.** `listItems({ status })` puts it in the WHERE
  clause so the database returns only matching rows. At five items that's irrelevant. At five
  thousand it's the difference between a fast page and a broken one.
- **Why the query string is treated as hostile.** `parseStatus` checks the value against
  `STATUSES` and falls back to `null`. It can't reach SQL unvalidated anyway because `items.ts`
  uses a parameterised query, so this is defence in depth. Its practical job is making
  `?status=nonsense` show everything instead of nothing.
- **Why `?status=A&status=B` needs handling.** A repeated query parameter arrives as an array, not
  a string. `parseStatus` takes the first and ignores the rest.
- **Why "All" is the absence of the parameter, not `?status=All`.** It keeps the unfiltered
  dashboard on a clean `/` and means there's no magic string to special-case.
- **Why there are two empty states.** "No results for this filter" and "nothing exists yet" look
  identical but mean opposite things. Offering *Add Equipment* to someone who has five items and
  just picked a filter matching none of them is misleading. What they want is *Clear filter*.
- **Why `encodeURIComponent` isn't optional.** Two of the four statuses contain a space, which has
  to become `%20` or the value never matches.

**Milestone:** all required dashboard features are done — list, status badges, filter, empty
state. Everything so far renders on the server with no client JavaScript. Phase 8 is the first
page that writes, and the first that genuinely needs `"use client"`.

**Commit:** `feat: add status filter to dashboard` (`8cb562a`) — 4 files, 172 insertions,
13 deletions

---

## 2026-08-14 — Phase 8 · Create form

**Goal:** `/items/new`. A validated form with a date picker that redirects on success. The first
page that writes, and the first component that genuinely needs `"use client"`.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> DEVLOG and then phase 8

**A structural decision made now to pay off in Phase 10:** `ItemForm` takes an optional `item`
prop. Its presence switches the component between create and edit — POST vs PUT, "Create item" vs
"Save changes", cancel-to-dashboard vs cancel-to-detail. Phase 10 is then a pre-filled instance of
the same component instead of a second 278-line file that drifts out of sync with this one.

**What I did by hand:** created `src/components/ItemForm.tsx` and `src/app/items/new/page.tsx`,
then tested the form through the browser and by bypassing it with curl.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- **Why this component earns `"use client"` and `FilterBar` didn't.** Four independent reasons
  here: `useState` for the values, `onSubmit` for the handler, `fetch` for the request,
  `useRouter` for the redirect. `FilterBar` looked interactive but was only links. The directive
  isn't about whether something feels interactive, it's about whether the code needs a client
  runtime.
- **The HTTP reason the form has to be a Client Component.** An HTML `<form>` can only send GET or
  POST. PUT isn't available to it. Using the correct verb for an edit needs `fetch`, and calling
  `fetch` from an event handler needs a client runtime. The HTTP requirement and the `"use client"`
  requirement are the same decision, not two.
- **Why validation runs in two places and why that isn't duplication.** The same
  `itemInputSchema` runs in the browser for instant feedback and again in the route handler,
  because `/api/items` is a public URL. Both failures produce `{ field: [messages] }` so they
  render through identical markup. One error path, not a client one and a server one. I proved the
  server half by curling invalid data straight past the form and still getting a 400.
- **Why `noValidate` is on the `<form>`.** Without it the browser shows its own validation bubbles
  for some fields while Zod renders inline messages for others. Two different UIs for the same
  problem. Turning the native one off means validation has one owner.
- **Why the submit button never re-enables on success.** POST isn't idempotent, so two clicks
  create two items. It stays disabled through the navigation because re-enabling during the
  transition reopens that window. On failure it does re-enable, because the user needs to retry.
- **Why `router.push()` is followed by `router.refresh()`.** The push navigates. The refresh
  re-runs the Server Components so the dashboard renders with the new row. `revalidatePath` in the
  route handler marked the cache stale, but something still has to ask for a fresh render.
- **Why `<input type="date">` and no date-picker library.** It is the date picker, natively. It
  reads and writes `YYYY-MM-DD` strings, exactly the format the `DATE` column, `to_char`, the
  `Item` type and the Zod schema all use. The value crosses the whole stack with no conversion,
  which is the reason that format was chosen in Phase 2.
- **Why `values.notes ?? ""` on the textarea.** `notes` is optional in the schema so it can be
  `undefined`, and a controlled input that receives `undefined` makes React switch it to
  uncontrolled and warn.
- **Why the checkout date doesn't default to today.** Computing "today" in component state would
  run during server render and again on the client. In different timezones those produce different
  dates and React reports a hydration mismatch. The field is required so the user picks it.

**Accessibility work that's easy to skip and I didn't:** every input has a `<label htmlFor>`,
errors are wired to their field with `aria-invalid` and `aria-describedby`, and the form-level
error banner uses `role="alert"` so it's announced when it appears. A red border communicates
nothing to a screen reader on its own.

**Commit:** `feat: add create item form with validation` (`a5dbc1b`) — 3 files, 392 insertions.
`ItemForm.tsx` at 278 lines is the largest component in the project and the only one used by two
pages.

---

## 2026-08-14 — Phase 9 · Item detail page

**Goal:** `/items/[id]` showing every field, with proper 404 handling. The item-name links added
in Phase 6 finally resolve.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> DEVLOG and then Phase 9

**What I did by hand:** created `src/app/items/[id]/page.tsx` and `src/app/not-found.tsx`, then
checked the 404 in the Network tab instead of trusting how it looked.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- **Why `notFound()` and not a rendered "not found" message.** `notFound()` throws. Next catches
  it, renders `not-found.tsx`, and sets the HTTP status to 404. Returning `<p>Not found</p>` from
  the component looks identical in the browser but sends 200 OK, which tells crawlers and
  monitoring the page exists. The status code is part of the response, not decoration. I checked
  the actual status in the Network tab on the document request.
- **`notFound()` also does work for TypeScript.** Because it never returns, `item` narrows to
  non-null on every line after it. No `!`, no cast. Calling it as a bare statement rather than
  returning its result is what makes that narrowing happen.
- **Why `cache()` from React wraps `getItem`.** `generateMetadata` and the page component both
  need the same record. Next dedupes `fetch()` automatically, but `getItem` is a plain async
  function calling a SQL driver, so Next has no way to know two calls are equivalent. `cache()`
  makes it explicit, memoised for one request. Without it every detail page load runs the same
  query twice.
- **Why the page calls `getItem()` directly instead of `fetch("/api/items/...")`.** This is the
  read path from the Phase 3 design. The page already runs on the server, so going over HTTP to
  reach a function in the same process is a round trip for nothing. The API is there for the
  browser, which is what the forms use.
- **Why `not-found.tsx` lives at the app root.** There it sits inside `layout.tsx`, so the 404
  still has the nav and footer and the user isn't stranded on a bare error page. Put it at
  `src/app/items/[id]/not-found.tsx` and it only covers that one route.
- **Why `whitespace-pre-wrap` on the notes.** HTML collapses every run of whitespace, newlines
  included, into a single space. Without that class, multi-line notes render as one paragraph.

**A deliberate omission:** the Delete button isn't on this page yet, even though the exam lists
Edit and Delete on the detail view. It needs a confirmation dialog and a DELETE fetch, which makes
it a Client Component and a unit of work on its own. That's Phase 11. I chose not to stub it,
because a button that silently does nothing is worse than one that's honestly absent.

**Commit:** `feat: add item detail page` (`47059f1`) — 3 files, 213 insertions

---

## 2026-08-14 — Phase 10 · Edit page

**Goal:** `/items/[id]/edit`. A pre-filled form that saves and redirects.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> DEVLOG and then Phase 10

**This phase was one file and 57 lines, and that's the point of it.** None of those lines are form
logic. The entire edit feature is:

```tsx
<ItemForm item={item} />
```

Because Phase 8 built `ItemForm` with an optional `item` prop, passing one in switches the same
component from POST to PUT, pre-fills every field, relabels the button, and redirects to the
detail page instead of the dashboard. The alternative, a second 278-line form, is the most common
way CRUD code rots: every future change to a field, a validation rule or a style has to be made
twice, and eventually isn't.

**What I did by hand:** created `src/app/items/[id]/edit/page.tsx`, then confirmed in the DevTools
Network tab that saving an edit issues a PUT, not a POST.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- **The serialization boundary, and why it vindicates a Phase 3 decision.** `EditItemPage` is a
  Server Component and `ItemForm` is a Client Component, so `item` is serialized to cross between
  them. The server embeds it in the payload and the browser reconstructs it. Only plain data
  survives that trip: objects, strings, numbers, `null`, arrays. Not functions, not class
  instances, **not `Date` objects**. `checkoutDate` is a string the whole way — Postgres `DATE`,
  `to_char` cast, `Item` type, this prop, `<input type="date">` — so it crosses four layers with
  no conversions. Had it been a `Date`, this prop would have been a problem to work around.
- **The pattern: the Server Component fetches, the Client Component receives via props.** The
  client never fetches its own initial data. No `useEffect`, no spinner, no flash of an empty
  form. The values are in the HTML when it arrives. I checked with View Source.
- **Why the edit page needs its own `notFound()` guard.** Without it, `/items/banana/edit` renders
  an empty form that then 404s on save. Failing up front is better than failing after the user has
  typed.
- **Which cache-invalidation mechanism is actually doing the work.** The PUT handler calls
  `revalidatePath("/")` and `revalidatePath("/items/{id}")`, but both routes are dynamic. They
  await `params` and query the database per request, so there's no Full Route Cache entry to
  clear. The real work is done by `router.refresh()` on the client, which drops the client-side
  router cache after a save. The `revalidatePath` calls are defensive and become load-bearing the
  moment any caching is introduced. Knowing which of the two is doing the work today is a better
  answer than adding a third call because it looked symmetrical.

**Milestone:** 12 commits, past the exam's 8–10 minimum, with three phases still to run. Every
required feature except Delete is built.

**Commit:** `feat: add edit item page` (`e3707c8`) — 2 files, 115 insertions

---

## 2026-08-14 — Phase 11 · Delete with confirmation

**Goal:** The last required feature. A Delete button on the detail page that asks for confirmation
before destroying anything.

**Tool:** Claude Code (Opus 5).

**Prompts I gave:**
> DEVLOG and then Phase 11
>
> DEVLOG and then Phase 12, I dont see the delete

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| No Delete button anywhere on the detail page | I created `DeleteButton.tsx` but never did step 2. The component was never imported or rendered in `src/app/items/[id]/page.tsx`. The file existed and compiled fine, nothing referenced it | Added the import and `<DeleteButton id={item.id} itemName={item.itemName} />` to the button row |

**Worth recording because of the failure mode.** An unused component produces no error at all. No
missing import, no type error, no console warning. It compiles, it lints, and it's just absent
from the page. The only thing that catches it is looking at the running app and noticing something
you expected isn't there. That's an argument for the verification tables in this log: "the file
exists" and "the feature works" are different claims, and only the second one matters.

**What I did by hand:** created `src/components/DeleteButton.tsx`, then wired it into the detail
page after spotting the omission.

**What I can explain:**

- **Why the native `<dialog>` element instead of `window.confirm()` or a hand-rolled modal.**
  `showModal()`, not `show()`, gets four things from the browser for free: focus trapped inside the
  dialog, Escape closes it, it renders in the top layer above everything regardless of z-index,
  and `::backdrop` becomes available for the dimmed overlay. `window.confirm()` is one line but is
  unstyleable, blocks the main thread, and looks like a browser security warning rather than part
  of the app. A hand-rolled `<div>` means reimplementing focus trapping and Escape handling, and
  getting focus management subtly wrong is the norm rather than the exception.
- **Why Delete is a `<button>` and never an `<a href>`.** DELETE isn't a safe method. Browsers,
  link prefetchers and crawlers follow links speculatively, so a destructive action behind an
  anchor eventually fires with nobody having clicked it. That's the concrete consequence of the
  safe/unsafe distinction from Phase 4.
- **Why the 204 response must not be parsed as JSON.** 204 No Content is success with no body by
  definition. `await response.json()` on an empty response throws, and since the delete has
  already succeeded at that point the user would see an error for an action that worked.
- **Why 404 gets its own message.** It's a real race, not defensive padding. Another tab or
  another person can delete the item between this page rendering and the button being clicked. I
  tested it with two browser tabs. "This item no longer exists" is useful, "something went wrong"
  isn't. This is `deleteItem()`'s boolean return and the handler's 404 from Phases 3 and 4 paying
  off end to end.
- **Why `router.push("/")` comes before `router.refresh()`.** The current page is about to stop
  existing, so leave it first, then re-render the dashboard without the row.
- **Why `useRef` and not `useState` for the dialog.** Its open/closed state is owned by the DOM
  element and exposed through the imperative `showModal()` and `close()` methods. Mirroring that
  in React state would create two sources of truth that can disagree.

**Milestone: all seven required features are complete.** Dashboard with badges, filter and empty
state; create with validation and a date picker; detail with Edit and Delete; pre-filled edit;
delete with confirmation; responsive throughout; consistent nav.

**Commit:** `feat: add delete with confirmation dialog` (`82d3086`)

---

## 2026-08-14 — Phase 12 · Loading, errors, responsive pass

**Goal:** Loading and error states, then actually check every page at 375px instead of assuming
it's fine.

**Tool:** Claude Code (Opus 5).

**Prompt I gave:**
> DEVLOG and then Phase 12, I dont see the delete

**What I did by hand:** added `src/app/loading.tsx` and `src/app/error.tsx`, went through every
page in the device toolbar at 375px, and tabbed through everything to check focus rings.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can explain:**

- `loading.tsx` is automatic. Next wraps the segment in a Suspense boundary and uses the file as
  the fallback. There's no `isLoading` flag anywhere in my code. Creating the file is the wiring.
- I used a skeleton instead of a spinner so the layout doesn't jump when real content arrives. It
  also makes Neon's cold start look intentional rather than broken.
- `error.tsx` has to be a Client Component. That's a Next requirement, not a preference. The
  boundary attaches on the client.
- In production, Next strips the error message before it reaches the browser and only sends a
  `digest`. So rendering `error.message` to the user is pointless. I log the error and show the
  digest so it can be matched against the server logs.
- `error.tsx` doesn't catch errors thrown by `layout.tsx`, because the layout renders outside the
  boundary. That needs `global-error.tsx`. I didn't add one.
- `reset()` re-renders the segment. It's a retry of the failed render, not a page reload.
- Index keys are fine in the skeleton even though I avoided them in the item list. The skeleton
  array is fixed-length and never reorders, so there's no identity for React to lose.

**How I checked responsive properly.** Eyeballing it isn't enough, so at 375px I ran this in the
console on every page:

```js
[...document.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > document.documentElement.clientWidth)
```

An empty array means nothing overflows. Anything it returns is what's causing horizontal scroll.

**Lint and build before committing.** Ran `npm run lint` and `npm run build`. Worth doing because
Next 16 removed `next lint` and `next build` no longer lints, so Vercel won't catch lint errors
for me. The production build also type-checks the whole project at once, which dev mode doesn't.

**Commit:** `style: responsive layout and interaction states` (`4f43bb0`) — 2 files, 93 insertions.
14 commits so far.

---

<!-- ==========================================================================
     ENTRY TEMPLATE — copy the block below for each phase.

     Write it immediately after the commit, while it is still fresh.
     Two to three minutes. Fourteen short honest entries beat three long
     reconstructed ones.

     REQUIRED by the exam brief (do not skip these three):
       · Tools    — which AI tool did this phase
       · Prompt   — the actual text I typed, pasted, not paraphrased
       · By hand  — what I changed or rejected myself

     The "By hand" section is the one that earns the marks. An entry reading
     "I asked for X, got X, used X" proves nothing. An entry reading "it gave
     me X, I replaced it with Y because Z" proves I read and understood it.
     If that section is empty for a phase, that is a signal I did not actually
     read the code — go back and read it.
     ==========================================================================

## YYYY-MM-DD — Phase N · <short name>

**Goal:** One sentence. What this phase had to achieve.

**Tool:** Claude Code / ChatGPT / Copilot — and which model, if it matters.

**Prompt I gave:**
> Paste the real prompt. Trim it if it is long, but do not rewrite it
> to sound smarter than it was.

**What came back:** Two to four lines. Which files, and the approach it took.

**What I changed by hand — and why:**
- `path/to/file.tsx` — <what I changed> — <why the original was wrong or worse>
- <or, if I accepted it as-is:> Accepted unchanged. I read it line by line and
  can explain <the specific mechanism>.

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**What I can now explain in the walkthrough:**
- <the one or two concepts this phase forced me to actually learn>

**Commit:** `<exact commit message>`

---
     ========================================================================== -->
