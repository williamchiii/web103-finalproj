DROP TABLE IF EXISTS reading_group_books CASCADE;
DROP TABLE IF EXISTS reading_groups CASCADE;
DROP TABLE IF EXISTS book_tags CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS shelves CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  github_id   TEXT        UNIQUE,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'organizer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shelves (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE tags (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE books (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shelf_id      INTEGER     REFERENCES shelves(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  author        TEXT        NOT NULL,
  status        TEXT        NOT NULL CHECK (status IN ('want_to_read', 'reading', 'finished')),
  notes         TEXT,
  started_at    DATE,
  finished_at   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_tags (
  book_id     INTEGER     NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  tag_id      INTEGER     NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (book_id, tag_id)
);

CREATE INDEX shelves_user_id_idx ON shelves (user_id);
CREATE INDEX tags_user_id_idx ON tags (user_id);
CREATE INDEX books_user_id_idx ON books (user_id);
CREATE INDEX books_shelf_id_idx ON books (shelf_id);
CREATE INDEX books_status_idx ON books (status);
CREATE INDEX books_updated_at_idx ON books (updated_at DESC);
CREATE INDEX book_tags_tag_id_idx ON book_tags (tag_id);

CREATE TABLE reading_groups (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE reading_group_books (
  group_id    INTEGER     NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
  book_id     INTEGER     NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, book_id)
);

CREATE INDEX reading_groups_user_id_idx ON reading_groups (user_id);
CREATE INDEX reading_group_books_book_id_idx ON reading_group_books (book_id);
