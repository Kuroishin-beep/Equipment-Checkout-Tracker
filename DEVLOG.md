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
| Claude Code (Opus 5) | Architecture planning, scaffolding, code review, this log |
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

<!--
Template for each following phase — keep entries short and specific.

## 2026-XX-XX — Phase N · <name>

**What I was doing:**
**What I asked:**
**What came back:**
**What I changed by hand and why:**
**Bugs hit and how I fixed them:**
**Commit:** `<message>`
-->
