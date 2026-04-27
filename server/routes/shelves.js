import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

async function ensureShelvesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shelves (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, name)
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

function userId(req) {
  return 1;
}

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        s.*,
        COUNT(b.id)::int AS book_count
       FROM shelves s
       LEFT JOIN books b ON b.shelf_id = s.id
       GROUP BY s.id
       ORDER BY s.name`,
    );
    res.json(rows);
  } catch (err) {
    if (err.code === "42P01") {
      await ensureShelvesTable();
      return res.json([]);
    }
    console.error(err);
    res.status(500).json({ error: "failed to fetch shelves" });
  }
});

router.post("/", async (req, res) => {
  const name = req.body?.name;
  const description = req.body?.description ?? null;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "shelf name is required" });
  }

  try {
    await ensureShelvesTable();
    const ownerId = userId(req);
    await ensureLibraryUser(ownerId);
    const normalizedName = name.trim();
    const existing = await pool.query("SELECT * FROM shelves WHERE user_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1", [
      ownerId,
      normalizedName,
    ]);

    if (existing.rows.length > 0) return res.status(200).json({ ...existing.rows[0], book_count: 0 });

    const { rows } = await pool.query(
      `INSERT INTO shelves (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ownerId, normalizedName, description],
    );
    res.status(201).json({ ...rows[0], book_count: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create shelf" });
  }
});

export default router;
