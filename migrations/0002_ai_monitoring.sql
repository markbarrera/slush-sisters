-- AI prompt monitoring (DataForSEO LLM Mentions API)
-- ==================================================
-- Weekly cron runs a set of prompts through DataForSEO's LLM Mentions
-- API and stores the results. The dashboard reads this table to show
-- whether AI assistants are mentioning Slush Sisters when people ask
-- about margarita machine rentals.
--
-- Apply with:  npx wrangler d1 execute slush_business --file=migrations/0002_ai_monitoring.sql

CREATE TABLE IF NOT EXISTS ai_monitor_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at      TEXT NOT NULL,                    -- ISO-8601 UTC
  prompt      TEXT NOT NULL,                    -- the search query tested
  platform    TEXT NOT NULL DEFAULT 'all',      -- chat_gpt | google | all
  mentioned   INTEGER NOT NULL DEFAULT 0,       -- 1 if slushsisters.com appeared
  mention_count INTEGER NOT NULL DEFAULT 0,     -- how many times across responses
  competitors TEXT,                              -- JSON array of other domains seen
  answer_snippet TEXT,                           -- first ~500 chars of the AI answer
  sources     TEXT,                              -- JSON array of source URLs returned
  raw         TEXT                               -- full API response JSON (debugging)
);
CREATE INDEX IF NOT EXISTS idx_ai_runs_prompt ON ai_monitor_runs(prompt, run_at);
CREATE INDEX IF NOT EXISTS idx_ai_runs_date ON ai_monitor_runs(run_at);
