import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

const VALID_STATUSES = new Set(["want_to_read", "reading", "finished"]);
const UPDATABLE_FIELDS = ["user_id", "shelf_id", "title", "author", "status", "notes", "started_at", "finished_at"];

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

router.get("/", async (req, res) => {
  const { status, shelf_id, tag_id } = req.query;
  const where = [];
  const params = [];

  if (status) {
    if (!VALID_STATUSES.has(status)) return sendError(res, 400, "invalid status");
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (shelf_id) {
    params.push(Number(shelf_id));
    where.push(`shelf_id = $${params.length}`);
  }
  if (tag_id) {
    // Tags join table doesn't exist yet (Issue #4). Silently ignore until then
    // so the frontend can pass the param without breaking.
  }

  const sql = `SELECT * FROM books ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY updated_at DESC`;
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to fetch books");
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return sendError(res, 400, "invalid id");
  try {
    const { rows } = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    if (rows.length === 0) return sendError(res, 404, "book not found");
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to fetch book");
  }
});

router.post("/", async (req, res) => {
  const { user_id, shelf_id, title, author, status, notes, started_at, finished_at } = req.body ?? {};
  if (!title || typeof title !== "string") return sendError(res, 400, "title is required");
  if (!author || typeof author !== "string") return sendError(res, 400, "author is required");
  if (!status || !VALID_STATUSES.has(status)) return sendError(res, 400, "status must be one of want_to_read, reading, finished");

  try {
    const { rows } = await pool.query(
      `INSERT INTO books (user_id, shelf_id, title, author, status, notes, started_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id ?? null, shelf_id ?? null, title, author, status, notes ?? null, started_at ?? null, finished_at ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to create book");
  }
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return sendError(res, 400, "invalid id");

  const body = req.body ?? {};
  const fields = UPDATABLE_FIELDS.filter((f) => Object.prototype.hasOwnProperty.call(body, f));
  if (fields.length === 0) return sendError(res, 400, "no updatable fields provided");

  if (body.status !== undefined && !VALID_STATUSES.has(body.status)) {
    return sendError(res, 400, "status must be one of want_to_read, reading, finished");
  }

  const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
  setClauses.push(`updated_at = NOW()`);
  const values = fields.map((f) => body[f]);
  values.push(id);

  const sql = `UPDATE books SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
  try {
    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) return sendError(res, 404, "book not found");
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to update book");
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return sendError(res, 400, "invalid id");
  try {
    const { rowCount } = await pool.query("DELETE FROM books WHERE id = $1", [id]);
    if (rowCount === 0) return sendError(res, 404, "book not found");
    res.status(204).end();
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to delete book");
  }
});

export default router;
