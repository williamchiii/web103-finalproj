import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

function userId(req) {
  return req.user?.id ?? 1;
}

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function parseOptionalId(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function groupSelectSql(whereClause = "") {
  return `
    SELECT
      g.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', b.id, 'title', b.title, 'author', b.author, 'status', b.status)
          ORDER BY gb.created_at ASC
        ) FILTER (WHERE b.id IS NOT NULL),
        '[]'
      ) AS books
    FROM reading_groups g
    LEFT JOIN reading_group_books gb ON gb.group_id = g.id
    LEFT JOIN books b ON b.id = gb.book_id
    ${whereClause}
    GROUP BY g.id
  `;
}

router.get("/", async (req, res) => {
  const ownerId = userId(req);
  try {
    const { rows } = await pool.query(
      `${groupSelectSql("WHERE g.user_id = $1")} ORDER BY g.created_at DESC`,
      [ownerId]
    );
    res.json(rows);
  } catch (err) {
    if (err.code === "42P01") return res.json([]);
    console.error(err);
    res.status(500).json({ error: "failed to fetch groups" });
  }
});

router.post("/", async (req, res) => {
  const name = req.body?.name;
  const description = req.body?.description ?? null;
  const ownerId = userId(req);

  if (!name || typeof name !== "string" || !name.trim()) {
    return sendError(res, 400, "group name is required");
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO reading_groups (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ownerId, name.trim(), description]
    );
    res.status(201).json({ ...rows[0], books: [] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return sendError(res, 400, "a group with this name already exists");
    res.status(500).json({ error: "failed to create group" });
  }
});

router.get("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const ownerId = userId(req);
  try {
    const { rows } = await pool.query(`${groupSelectSql("WHERE g.id = $1 AND g.user_id = $2")}`, [id, ownerId]);
    if (rows.length === 0) return sendError(res, 404, "group not found");
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch group" });
  }
});

router.patch("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const ownerId = userId(req);
  const name = req.body?.name;
  const description = req.body?.description;

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return sendError(res, 400, "group name cannot be empty");
  }

  try {
    const updates = [];
    const values = [];
    if (name !== undefined) {
      values.push(name.trim());
      updates.push(`name = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (updates.length === 0) return sendError(res, 400, "no updatable fields provided");

    values.push(id, ownerId);
    const { rowCount } = await pool.query(
      `UPDATE reading_groups SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND user_id = $${values.length}`,
      values
    );

    if (rowCount === 0) return sendError(res, 404, "group not found");

    const { rows } = await pool.query(`${groupSelectSql("WHERE g.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return sendError(res, 400, "a group with this name already exists");
    res.status(500).json({ error: "failed to update group" });
  }
});

router.delete("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }
  const ownerId = userId(req);

  try {
    const { rowCount } = await pool.query("DELETE FROM reading_groups WHERE id = $1 AND user_id = $2", [id, ownerId]);
    if (rowCount === 0) return sendError(res, 404, "group not found");
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete group" });
  }
});

router.post("/:id/books", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const bookId = req.body?.book_id;
  if (!Number.isInteger(bookId) || bookId <= 0) return sendError(res, 400, "book_id is required and must be a positive integer");

  const ownerId = userId(req);

  try {
    // Ensure user owns both the group and the book
    const { rowCount: groupCount } = await pool.query("SELECT 1 FROM reading_groups WHERE id = $1 AND user_id = $2", [id, ownerId]);
    if (groupCount === 0) return sendError(res, 404, "group not found");

    const { rowCount: bookCount } = await pool.query("SELECT 1 FROM books WHERE id = $1", [bookId]);
    if (bookCount === 0) return sendError(res, 404, "book not found");

    await pool.query(
      "INSERT INTO reading_group_books (group_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, bookId]
    );

    const { rows } = await pool.query(`${groupSelectSql("WHERE g.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to attach book to group" });
  }
});

router.delete("/:id/books/:bookId", async (req, res) => {
  let id, bookId;
  try {
    id = parseOptionalId(req.params.id, "id");
    bookId = parseOptionalId(req.params.bookId, "bookId");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const ownerId = userId(req);

  try {
    const { rowCount: groupCount } = await pool.query("SELECT 1 FROM reading_groups WHERE id = $1 AND user_id = $2", [id, ownerId]);
    if (groupCount === 0) return sendError(res, 404, "group not found");

    await pool.query(
      "DELETE FROM reading_group_books WHERE group_id = $1 AND book_id = $2",
      [id, bookId]
    );

    const { rows } = await pool.query(`${groupSelectSql("WHERE g.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to detach book from group" });
  }
});

export default router;
