-- Slush Sisters — business database (Cloudflare D1 / SQLite)
-- ==========================================================
-- Slice 1 of the business dashboard. This is the single source of truth the
-- private Cockpit writes to and the public /ledger reads from. It lives inside
-- Mark's own Cloudflare account (D1), so customer PII never leaves it.
--
-- Conventions:
--   * Money is stored as INTEGER CENTS, never floats. $250.00 -> 25000.
--     (Floats drift; cents never do. The UI formats cents into dollars.)
--   * Timestamps are ISO-8601 TEXT (UTC), e.g. 2026-08-05T19:14:11Z.
--   * Rows are added, not quietly deleted — same honesty rule as the public
--     ledger. A canceled booking gets status='canceled', it is not removed.
--
-- Apply with:  npx wrangler d1 execute slush_business --file=migrations/0001_business.sql
-- (see docs/business-dashboard.md for the full provisioning click-path)

-- Each booking: the customer + the event. Created from the /book form (the
-- Worker writes it alongside the email it already sends), then the girls work
-- it in the Cockpit.
CREATE TABLE IF NOT EXISTS bookings (
  ref               TEXT PRIMARY KEY,          -- the bk_… id shared with PostHog + the email
  created_at        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'new', -- new | confirmed | delivered | canceled
  -- Contact PII. Lives here only; never sent to PostHog.
  name              TEXT,
  address           TEXT,
  contact           TEXT,
  -- The event.
  event_date        TEXT,
  tier              TEXT,                        -- Classic | Fresh Press
  flavor_1          TEXT,
  flavor_2          TEXT,
  guest_count       INTEGER,
  notes             TEXT,
  -- Attribution — the "how they found us" half of the funnel.
  heard_from        TEXT,
  heard_from_detail TEXT,
  utm_source        TEXT,
  utm_campaign      TEXT,
  -- Money. price = what we expect to bill; paid = what actually landed.
  price_cents       INTEGER NOT NULL DEFAULT 0,
  paid_cents        INTEGER NOT NULL DEFAULT 0,
  delivered_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);

-- Costs. A row tied to a booking is that party's cost of doing it (mix, cups,
-- candy, fuel). A row with booking_ref = NULL is an overhead/fixed cost (the
-- machine, insurance, the LLC fee) — the bills that come whether or not there
-- is a party. is_estimate mirrors the "est" badge on the public ledger.
CREATE TABLE IF NOT EXISTS costs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_ref   TEXT REFERENCES bookings(ref),  -- NULL = overhead
  created_at    TEXT NOT NULL,
  category      TEXT NOT NULL,                   -- mix | cups | candy | fuel | insurance | equipment | fees | other
  label         TEXT,
  amount_cents  INTEGER NOT NULL,
  is_estimate   INTEGER NOT NULL DEFAULT 0,      -- 0/1
  note          TEXT
);
CREATE INDEX IF NOT EXISTS idx_costs_booking ON costs(booking_ref);

-- The jar ledger (Profit First for kids). Append-only: every entry is a movement
-- into (+) or out of (−) a jar. A jar's balance is just the SUM of its entries,
-- so nothing can silently disappear. When a booking is paid, the Cockpit splits
-- the payment into these jars per the percentages in settings.
CREATE TABLE IF NOT EXISTS jar_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL,
  jar           TEXT NOT NULL,                   -- supplies | tax | payback | profit | pay
  amount_cents  INTEGER NOT NULL,                -- + in, − out
  booking_ref   TEXT REFERENCES bookings(ref),
  note          TEXT
);
CREATE INDEX IF NOT EXISTS idx_jar_jar ON jar_entries(jar);

-- Recipes. Some are public (they render on the site); some hold the freeze
-- knowledge docs/big-ideas.md calls the closest thing to a trade secret, so
-- is_public defaults to 0.
CREATE TABLE IF NOT EXISTS recipes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL,
  name          TEXT NOT NULL,
  flavor        TEXT,
  mix_ratio     TEXT,
  freeze_note   TEXT,
  candy_pairing TEXT,
  is_public     INTEGER NOT NULL DEFAULT 0
);

-- Learnings. One line per party (the Party Report Card idea), or general
-- lessons (booking_ref = NULL). These feed the reading room and the annual
-- report.
CREATE TABLE IF NOT EXISTS learnings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL,
  booking_ref   TEXT REFERENCES bookings(ref),  -- NULL = general lesson
  body          TEXT NOT NULL,
  tag           TEXT
);

-- Settings: the numbers that drive the math, editable without a code change.
CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

-- Seed: the loan still owed to Dad (from the public ledger: ≈ $1,617), the tax
-- set-aside rate, and the jar split. The split is the teaching model — tune it
-- with the girls; it does not have to sum to 100 because "pay" (their wages) can
-- come out of profit. These are starting values, not gospel.
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('loan_start_cents', '161700'),   -- ≈ $1,617 fronted by parents
  ('tax_rate',         '0.10'),     -- 10% of revenue set aside for tax (teaching default)
  ('split_supplies',   '0.20'),     -- 20% → next party's mix/cups/candy
  ('split_payback',    '0.40'),     -- 40% → pay Dad back
  ('split_profit',     '0.20'),     -- 20% → profit (theirs)
  ('split_pay',        '0.10');     -- 10% → Harper & Finley's wages
