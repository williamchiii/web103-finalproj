import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

async function ensureTagsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, name)
    )
  `);
}

async function ensureBookTagsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS book_tags (
      book_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (book_id, tag_id)
    )
  `);
}

async function ensureLibraryUser(ownerId) {
  try {
    const { rowCount } = await pool.query("SELECT 1 FROM users WHERE id = $1", [ownerId]);
    if (rowCount > 0) return;
  } catch (err) {
    if (err.code !== "42P01") throw err;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'reader',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  try {
    await pool.query(
      `INSERT INTO users (id, github_id, name, email, avatar_url, role)
       VALUES ($1, $2, $3, $4, NULL, 'reader')
       ON CONFLICT (id) DO NOTHING`,
      [ownerId, `demo-readwell-${ownerId}`, "ReadWell Demo Reader", `demo+${ownerId}@readwell.local`],
    );
  } catch (err) {
    if (err.code !== "42703") throw err;
    await pool.query(
      `INSERT INTO users (id, name, email, role)
       VALUES ($1, $2, $3, 'reader')
       ON CONFLICT (id) DO NOTHING`,
      [ownerId, "ReadWell Demo Reader", `demo+${ownerId}@readwell.local`],
    );
  }

  await pool.query("SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT MAX(id) FROM users), 1), true)");
}

function userId() {
  return 1;
}

router.get("/", async (_req, res) => {
  try {
    await ensureTagsTable();
    await ensureBookTagsTable();
    const { rows } = await pool.query(
      `SELECT
        t.*,
        COUNT(bt.book_id)::int AS book_count
       FROM tags t
       LEFT JOIN book_tags bt ON bt.tag_id = t.id
       GROUP BY t.id
       ORDER BY t.name`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch tags" });
  }
});

router.post("/", async (req, res) => {
  const name = req.body?.name;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "tag name is required" });
  }

  try {
    await ensureTagsTable();
    await ensureBookTagsTable();
    const ownerId = userId();
    await ensureLibraryUser(ownerId);
    const normalizedName = name.trim();
    const existing = await pool.query("SELECT * FROM tags WHERE user_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1", [
      ownerId,
      normalizedName,
    ]);

    if (existing.rows.length > 0) return res.status(200).json({ ...existing.rows[0], book_count: 0 });

    const { rows } = await pool.query(
      `INSERT INTO tags (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [ownerId, normalizedName],
    );
    res.status(201).json({ ...rows[0], book_count: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create tag" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "invalid tag id" });
  
  try {
    const { rowCount } = await pool.query("DELETE FROM tags WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "tag not found" });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete tag" });
  }
});

export default router;
