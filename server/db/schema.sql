DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE books (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER,
  shelf_id      INTEGER,
  title         TEXT        NOT NULL,
  author        TEXT        NOT NULL,
  status        TEXT        NOT NULL CHECK (status IN ('want_to_read', 'reading', 'finished')),
  notes         TEXT,
  started_at    DATE,
  finished_at   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX books_status_idx ON books (status);
CREATE INDEX books_updated_at_idx ON books (updated_at DESC);
