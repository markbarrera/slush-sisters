-- Top-5 leaderboard per game. Initials only (3 chars), no PII.
CREATE TABLE IF NOT EXISTS leaderboard (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  game     TEXT NOT NULL,
  initials TEXT NOT NULL CHECK(length(initials) <= 3),
  score    REAL NOT NULL,
  ts       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_lb_game ON leaderboard(game);
