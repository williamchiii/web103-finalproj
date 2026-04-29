import { pool } from "../config/database.js";

export async function migrateReadingGroups() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reading_groups (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        TEXT        NOT NULL,
        description TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, name)
      );

      CREATE TABLE IF NOT EXISTS reading_group_books (
        group_id    INTEGER     NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
        book_id     INTEGER     NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id, book_id)
      );

      CREATE INDEX IF NOT EXISTS reading_groups_user_id_idx ON reading_groups (user_id);
      CREATE INDEX IF NOT EXISTS reading_group_books_book_id_idx ON reading_group_books (book_id);
    `);
    console.log("✓ reading_groups migration applied");
  } catch (err) {
    console.error("reading_groups migration failed:", err.message);
  }
}
