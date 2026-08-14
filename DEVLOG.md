# DEVLOG — AI-Assisted Development Log

Equipment Checkout Tracker · CRUD.IT Solutions Inc. Developer Coding Exam

The exam allows AI tools but requires that I can explain every line. This log records
what I asked for, what I accepted, what I rejected, and what I changed by hand — so the
reasoning behind the code is on the record, not just the output.

**Format of each entry:** what I was doing · what I asked the AI · what it produced ·
what I changed or rejected and why.

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

**What I was doing:** Turning the exam PDF into a concrete architecture before writing any code.

**What I asked:**
> Scan this PDF, and plan/map out the bases first before continuing. What steps should be
> done first and then map out the files needed for the full webapp to work. Do not go out of
> scope — just create a simple dashboard that manages company equipment loans. Tell me what
> database should be used or how we will keep the retention, as well as the HTTP methods that
> will be implemented and how. Do not code anything at first and keep a DEVLOG.md.
> Can a Neon DB be used here? Stay within the scope of tech expectations.

**What came back:** [`PLAN.md`](PLAN.md) — scope boundary, stack table, 14-phase build order
mapped to commits, full file map with the Server/Client split marked per file, SQL schema,
the persistence analysis, and the HTTP method contract.

**Decisions I made and the reasoning I want on record:**

1. **Route Handlers, not Server Actions.** The exam allows either, but it also says
   "proper HTTP methods". Server Actions are always a `POST` under the hood no matter what
   they do, so they cannot demonstrate `PUT` or `DELETE`. Route Handlers make the verb
   explicit and give an API I can test with `curl` before the UI exists.

2. **Neon Postgres, not in-memory or a JSON file.** The exam permits all three, but the
   other two do not actually persist on Vercel — each request can hit a different
   serverless instance, and the filesystem is read-only outside `/tmp`. An in-memory array
   works perfectly in `next dev` and then loses data in production, which is the worst
   possible failure mode for a demo. Reasoning written up in `PLAN.md` §6.

3. **Raw parameterised SQL, no ORM.** Prisma and Drizzle would both work, but the exam's
   bar is "explain every line". `SELECT * FROM items WHERE status = $1` needs no framework
   vocabulary to defend. The tagged-template driver parameterises values automatically, so
   dropping the ORM does not cost me injection safety.

4. **All SQL confined to `lib/items.ts`.** Pages and route handlers only call named
   functions. This is also the escape hatch: if Neon cannot be provisioned on the day, one
   file gets swapped for an in-memory array and nothing else in the app changes.

5. **API built before UI (Phase 4 before Phase 6).** If the endpoints are already verified
   with `curl`, then any bug found while building a page is a UI bug by elimination.

6. **Deploy the empty template first (Phase 1).** Straight from the exam's own tips. A
   build failure is cheap on day one and expensive an hour before submission.

**What I pushed back on / trimmed from scope:** an ORM, a component library, an auth layer,
pagination, and multiple tables. None are asked for, and each one is more surface area to
defend in the walkthrough. Listed explicitly under "Deliberately out of scope" in `PLAN.md` §1
so the omissions read as decisions rather than gaps.

**Verified rather than assumed:** current package versions were checked against the npm
registry instead of taken from the model's memory — Next.js 16.3.0, Tailwind 4.3.3,
`@neondatabase/serverless` 1.1.0, Zod 4.4.3.

**Written by hand:** this entry.

**Status:** No application code written yet. Next up is Phase 1 — scaffold and deploy.

---

## 2026-08-14 — Phase 1 · Scaffold and deploy

**Goal:** Get an empty but real Next.js app deployed to Vercel from GitHub *before* writing a
single feature, so that deployment stops being a submission-day risk. Straight from the exam's
own tips: "Deploy to Vercel first, even with just the default template."

**Tool:** Claude Code (Opus 5) — for an environment audit and written instructions **only**.
I ran every command myself. Nothing in commit `4eacfe6` was authored by the AI: the commit is
`create-next-app` output plus my own git work.

**Prompt I gave:**
> GIVe me the isntructions on how to do the phase 1 on my own and explain each step of it

**What came back:** An 11-step guide, a table explaining every `create-next-app` flag, a
done-checklist and a troubleshooting table. Three things it checked on my actual machine
rather than assumed, each of which changed the instructions:

- Node v22.21.1, npm 10.9.4, git 2.46.0 — all fine for Next 16, which needs Node ≥ 20.9
- `gh` CLI is **not** installed here → the GitHub and Vercel steps had to be browser-based
- `origin` was **already** pointed at `github.com/Kuroishin-beep/Equipment-Checkout-Tracker`
  and the repo was empty → no repo creation and no `git remote add` needed

It also test-ran `create-next-app` against a throwaway folder containing dummy `PLAN.md` and
`DEVLOG.md` files, which proved in advance that the scaffold would refuse to run here:

> The directory contains files that could conflict: DEVLOG.md, PLAN.md

`create-next-app` only tolerates a known-safe list of pre-existing files (`.git`, `.gitignore`,
`README.md`, `LICENSE`…) and my two planning docs are not on it. That turned a blocker I would
otherwise have hit mid-command into two planned steps.

**What I did by hand — all of it:**

1. Staged and committed the planning docs → `7d32b2d` (00:52). Doing this *first* meant the
   docs were recoverable via `git checkout` before I moved them anywhere.
2. Moved `PLAN.md` and `DEVLOG.md` up to `E:/Github/` so the folder held only `.git/`
3. Ran the scaffold:
   `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes`
4. Moved both docs back into the repo root
5. Read `.gitignore` and confirmed `node_modules` and `.env*` were both covered
6. `npm run dev`, loaded `localhost:3000`, confirmed the starter page rendered, `Ctrl+C`
7. `git add -A`, then checked `git status --short` for stray `node_modules` *before* committing
8. Committed → `4eacfe6` (01:07) — 19 files, 7,089 insertions
9. `git push -u origin main`
10. Imported the repo on vercel.com in the browser, confirmed Framework Preset auto-detected
    **Next.js**, left Environment Variables deliberately empty (the database is Phase 2), deployed

Fifteen minutes between the two commits. `git reflog` shows no resets, amends or stashes, so
it went through on the first attempt.

**Live URL:** <!-- TODO: paste the .vercel.app URL here -->

**Versions actually installed** (from `package.json`, not from what I expected):
`next` 16.3.0 · `react` / `react-dom` 19.2.8 · `tailwindcss` ^4 · `typescript` ^5 · `eslint` ^9

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| <!-- fill in, or write "None — the pre-flight check caught the only blocker before I hit it" --> | | |

**What I can now explain in the walkthrough:**

Reading the generated files instead of just accepting them turned up five things specific to
this stack version. I verified the first two against the docs shipped inside
`node_modules/next/dist/docs/` rather than trusting the AI's memory:

- **`"dev": "next dev"` carries no `--turbopack` flag.** On Next 15 this script reads
  `next dev --turbopack`. The flag is absent in Next 16 because Turbopack became the *default*
  bundler, not because it was dropped. Webpack is now the opt-in: `next dev --webpack`.
- **`"lint": "eslint"`, not `next lint`.** Next 16 removed the `next lint` command entirely —
  you call ESLint directly, with flat config in `eslint.config.mjs` (ESLint 9). The consequence
  that actually matters: **`next build` no longer runs linting**, so Vercel's build will not
  fail on a lint error. I have to run `npm run lint` myself.
- **There is no `tailwind.config.js`, and that is correct.** Tailwind v4 moved configuration
  into CSS — `src/app/globals.css` opens with `@import "tailwindcss"`, and the build wiring is
  the `@tailwindcss/postcss` plugin in `postcss.config.mjs`. Hunting for the missing config
  file is the classic v3 → v4 mistake.
- **`next-env.d.ts` is on disk but absent from the commit** because `.gitignore` line 41 ignores
  it. It is regenerated on every `next dev` / `next build`, so committing it is pure churn.
- **`--disable-git` earned its place.** Without it, `create-next-app` can run `git init` *and*
  write its own commit titled "Initial commit from Create Next App". The exam grades commit
  history, so every commit in this repo needed to be mine.

**One assumption I checked and threw away:** I initially read `AGENTS.md` and `CLAUDE.md` as
evidence that `next dev` had been run before committing, since `AGENTS.md` says its contents are
"written and re-added by `next dev`". The installation doc says otherwise — `create-next-app`'s
default setup already "includes `AGENTS.md` (with a `CLAUDE.md` that references it)". Both files
would be in that commit either way, so they prove nothing about when the dev server ran. Noting
it because the reasoning was wrong even though the conclusion happened to be right.

**Carried forward into Phase 2:** `.gitignore` line 34 is `.env*` — broader than the
`.env*.local` I expected. It ignores `.env.example` too, so committing that template will need
`git add -f .env.example`. Better to know that now than to spend ten minutes wondering why the
file will not stage.

**Still open:** `README.md` is still the stock `create-next-app` text. Phase 13 replaces it with
setup instructions, tech choices and what I would improve — which is what the exam actually asks
for.

**Commit:** `chore: scaffold next.js 16 app with ts and tailwind` (`4eacfe6`)

---

## 2026-08-14 — Phase 2 · Database, schema, seed

**Goal:** A real Postgres database with a validated `items` table and five sample rows, plus
the `DATABASE_URL` wiring in both places it is needed — local and Vercel. No application code;
nothing reads the database until Phase 3.

**Tool:** Claude Code (Opus 5), for the schema design and the reasoning behind each column type.
I created every file and ran every statement myself.

**Prompts I gave,** in order — the sequence matters more than any single one:
> let's do phase 2
>
> no i should do all of it by me
>
> how do i populate the schema.sql
>
> give em the full schmea and how to do it step by step first
>
> what am i inputting insed .env.example and .env.local

**What happened — the process correction is the story of this phase.** The first response wrote
`db/schema.sql`, `db/seed.sql` and `.env.example` directly into the repo. I stopped it: for an
exam whose bar is "explain every line", files I did not author are files I cannot defend. It
reverted all three (`git checkout` on the tracked one, delete on the untracked two) and switched
to teaching the SQL patterns against a throwaway `books` table instead, so I had to map the
constructs onto `items` myself rather than paste.

I then asked for the full schema explicitly, having already worked through the shape. That is a
different thing from having it written for me unasked, and the distinction is one I want on the
record: **I decided when to look at the answer.**

**What I did by hand:**

- Created `db/` and both `.sql` files
- Worked through `CREATE TABLE` syntax from the pattern examples before asking for the full version
- Ran `db/schema.sql` in the Neon SQL Editor, then verified against `information_schema.columns`
- Deliberately ran an `INSERT` with status `'Borrowed'` to watch the `CHECK` constraint reject it
- Ran `db/seed.sql`, confirmed the trailing `SELECT` returned 5 rows
- **Trimmed `.env.example` down to one line.** The suggested version was a ~25-line comment block
  explaining pooling. I kept the variable and the placeholder and cut the essay — the reasoning
  already lives in `PLAN.md` §6, and duplicating it into a config template just means two places
  to keep in sync. Final file is 109 bytes.
- Created `.env.local`, pasted the real pooled connection string, verified it is gitignored

**Bugs I hit:**

| Symptom | Cause | Fix |
|---------|-------|-----|
|         |       |     |

**Verification I actually ran** (not "it looked right"):

| Check | Expected | Result |
|-------|----------|--------|
| `information_schema.columns` for `items` | 9 columns, `notes` the only nullable | |
| `INSERT` with status `'Borrowed'` | rejected by CHECK constraint | |
| `SELECT count(*) FROM items` after seed | 5 | |
| `git check-ignore -v .env.local` | `.gitignore:34:.env*` | confirmed |
| `.env.example` scanned for real credentials | 0 matches | confirmed |

**What I can now explain in the walkthrough:**

- **Why `DATE` and not `TIMESTAMPTZ`.** A checkout date has no time component. As a timestamp it
  goes through timezone conversion, and a value near midnight renders as the previous day for a
  user in another timezone. `DATE` carries no timezone, so it cannot drift.
- **Why `NOT NULL` is not enough.** `NOT NULL` accepts `"   "` as a valid string. The
  `CHECK (length(trim(item_name)) > 0)` is what actually rejects it. I proved this by running the
  bad insert rather than assuming.
- **Why `TEXT` + `CHECK` and not a native `ENUM`.** Both reject invalid values. A `CHECK` is one
  `ALTER TABLE` to change; adding or reordering `ENUM` values is markedly more painful. Four
  statuses could plausibly become five.
- **Why the connection string needs `-pooler`.** Vercel runs the app as serverless functions that
  can scale to many concurrent instances. The pooled endpoint puts PgBouncer in front of Postgres
  so short-lived connections do not exhaust the connection limit. The direct endpoint works
  perfectly on localhost and then fails under load in production — the same class of trap as
  in-memory storage.
- **Why `.env.example` is committed and `.env.local` is not.** Same variable name, different
  values: the template documents *which* variables exist so a fresh clone does not crash with a
  cryptic error; the local file holds the actual secret and is matched by `.env*` in `.gitignore`.
- **Why Neon and Vercel are both set to Singapore.** The latency that matters is *function to
  database*, not browser to database. Vercel defaults to Washington DC; leaving that with Neon in
  Singapore sends every query across the Pacific and back.

**Two constraints deliberately duplicated:** `status` and `condition` are validated in the
database via `CHECK`, and will be validated again by Zod in Phase 3. That is intentional, not
redundant — the Zod schema gives the user a readable inline error, and the database constraint is
the backstop that holds even if someone bypasses the app and writes SQL directly.

**Carried in from Phase 1 and resolved:** the `.gitignore` line-34 `.env*` note. `.env.example`
was force-added with `git add -f` while empty in commit `6bf0066`; because it is now tracked, the
ignore rule no longer applies to it and this phase's edit staged normally.

**Still open at the end of this phase:**
- The commit is not yet pushed (`main` is ahead of `origin/main` by 1)
- `DATABASE_URL` still needs adding to Vercel for all three environments
- Vercel function region still needs setting to `sin1`
- `README.md` remains the stock `create-next-app` text — Phase 13

**Commit:** `feat: add postgres schema and seed data` (`1270fc9`) — 3 files, 95 insertions

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
