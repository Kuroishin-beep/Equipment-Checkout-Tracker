-- ============================================================================
-- Equipment Checkout Tracker — database schema
--
-- Run once in the Neon SQL Editor:
--   Neon Console -> your project -> SQL Editor -> paste -> Run
--
-- Safe to re-run: every statement is guarded with IF NOT EXISTS.
-- Seed data lives separately in db/seed.sql, so re-running this file never
-- touches your rows.
-- ============================================================================

CREATE TABLE IF NOT EXISTS items (
  -- gen_random_uuid() is built into Postgres 13+ core, so no
  -- CREATE EXTENSION pgcrypto is required. Neon runs Postgres 14+.
  --
  -- UUID rather than SERIAL: an incrementing integer in a URL leaks how many
  -- records exist, and lets anyone walk /items/1, /items/2, /items/3.
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- NOT NULL rejects a missing value. The CHECK additionally rejects "   ",
  -- which NOT NULL on its own accepts as a perfectly valid string.
  item_name     TEXT        NOT NULL CHECK (length(trim(item_name))  > 0),
  assigned_to   TEXT        NOT NULL CHECK (length(trim(assigned_to)) > 0),

  -- TEXT + CHECK rather than a native Postgres ENUM. Both reject bad values,
  -- but a CHECK is one ALTER TABLE to change, whereas adding or reordering
  -- ENUM values is significantly more painful. These four could gain a fifth.
  status        TEXT        NOT NULL CHECK (status    IN ('Available', 'Checked Out', 'Under Repair', 'Retired')),
  condition     TEXT        NOT NULL CHECK (condition IN ('New', 'Good', 'Fair', 'Poor')),

  -- DATE, not TIMESTAMPTZ. A checkout date has no time component. Stored as a
  -- timestamp it would go through timezone conversion, and a value near
  -- midnight can render as the previous day for a user in another timezone.
  -- DATE carries no timezone, so it cannot drift.
  checkout_date DATE        NOT NULL,

  -- The only optional field in the exam's data model. No NOT NULL = nullable.
  notes         TEXT,

  -- Not in the exam spec. created_at is a stable tiebreaker when two rows
  -- share a checkout_date. updated_at is set explicitly by the UPDATE
  -- statement in lib/items.ts rather than by a trigger, so there is no hidden
  -- database behaviour to explain during the walkthrough.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supports the dashboard's "filter by status".
CREATE INDEX IF NOT EXISTS items_status_idx ON items (status);

-- Supports the default list ordering and the bonus "sort by checkout date".
CREATE INDEX IF NOT EXISTS items_checkout_date_idx ON items (checkout_date DESC);

-- Honest note on those indexes: at this table's size Postgres will ignore them
-- and sequentially scan, because scanning a handful of rows is cheaper than
-- consulting an index. They are here because they match the query patterns at
-- real scale, and they cost effectively nothing now.