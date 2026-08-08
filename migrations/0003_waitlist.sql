-- Waitlist (date-open notification list)
-- ======================================
-- "Want us to email you when dates open?" — one email, one time, then done.
-- Not a newsletter. The Worker writes a row on POST /api/waitlist; Mark
-- exports the list when it is time to send the one email.
--
-- Apply with:  npx wrangler d1 execute slush_business --file=migrations/0003_waitlist.sql

CREATE TABLE IF NOT EXISTS waitlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL,                    -- ISO-8601 UTC
  email       TEXT NOT NULL,
  source      TEXT,                              -- page path the signup came from
  notified    INTEGER NOT NULL DEFAULT 0         -- 1 once the "dates open" email is sent
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
