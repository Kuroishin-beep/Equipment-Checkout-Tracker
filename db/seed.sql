-- ============================================================================
-- Equipment Checkout Tracker — development seed data
--
-- Run in the Neon SQL Editor AFTER db/schema.sql.
--
-- This file DELETES every row before inserting, so it is a RESET, not an
-- append. Re-run it any time to return to a known demo state — useful right
-- before the code walkthrough.
--
-- To test the dashboard's required empty state:
--   1. Run just the DELETE line below
--   2. Reload the app — the empty state should appear
--   3. Re-run this whole file to restore the sample data
-- ============================================================================

DELETE FROM items;

-- These five rows deliberately cover every branch the UI has to render:
--   · all four statuses     -> every status badge colour is visible
--   · all four conditions   -> every condition badge is visible
--   · one NULL notes value  -> proves the optional field renders when absent
--   · a date from last year -> proves date sorting is not accidentally correct
--
-- "Assigned To" is required in the exam's data model, so it cannot be NULL for
-- items nobody currently holds. 'Unassigned' and 'IT Storage' are explicit
-- placeholder holders rather than leaving the column empty.
INSERT INTO items (item_name, assigned_to, status, condition, checkout_date, notes) VALUES
  ('MacBook Pro 16" M3',          'Bryan Dale',     'Checked Out',  'Good', DATE '2026-07-28', 'Primary development machine. Charger and USB-C hub included.'),
  ('Dell UltraSharp U2723QE 27"', 'Unassigned',     'Available',    'New',  DATE '2026-08-01', NULL),
  ('Canon EOS R6 Mark II',        'Marketing Team', 'Under Repair', 'Fair', DATE '2026-06-15', 'Shutter jamming intermittently. Sent to service centre 2026-08-02.'),
  ('Logitech MX Master 3S',       'Unassigned',     'Available',    'Good', DATE '2026-08-10', 'Returned from previous assignment, cleaned and tested.'),
  ('ThinkPad X1 Carbon Gen 9',    'IT Storage',     'Retired',      'Poor', DATE '2025-11-03', 'Battery swollen, chassis cracked. Flagged for e-waste disposal.');

-- Verification — expect 5 rows back.
SELECT item_name, assigned_to, status, condition, checkout_date
FROM items
ORDER BY checkout_date DESC;