import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

const DEFAULT_USER_ID = 1;
const VALID_STATUSES = new Set(["want_to_read", "reading", "finished"]);
const UPDATABLE_FIELDS = ["user_id", "shelf_id", "title", "author", "status", "notes", "started_at", "finished_at"];
const LEGACY_UPDATABLE_FIELDS = ["shelf_id", "title", "author", "status", "notes", "started_at", "finished_at"];

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function requestError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseOptionalId(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function normalizeTagIds(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("tag_ids must be an array");

  const ids = [...new Set(value.map((id) => Number(id)))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error("tag_ids must contain positive integers");
  }
  return ids;
}

async function ensureUserExists(userId) {
  try {
    const { rowCount } = await pool.query("SELECT 1 FROM users WHERE id = $1", [userId]);
    if (rowCount > 0) return true;
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
      [userId, `demo-readwell-${userId}`, "ReadWell Demo Reader", `demo+${userId}@readwell.local`],
    );
  } catch (err) {
    if (err.code !== "42703") throw err;
    await pool.query(
      `INSERT INTO users (id, name, email, role)
       VALUES ($1, $2, $3, 'reader')
       ON CONFLICT (id) DO NOTHING`,
      [userId, "ReadWell Demo Reader", `demo+${userId}@readwell.local`],
    );
  }

  await pool.query("SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT MAX(id) FROM users), 1), true)");
  const { rowCount } = await pool.query("SELECT 1 FROM users WHERE id = $1", [userId]);
  return rowCount > 0;
}

async function ensureShelfExists(shelfId, userId) {
  if (shelfId === null) return true;
  const { rowCount } = await pool.query("SELECT 1 FROM shelves WHERE id = $1", [shelfId]);
  return rowCount > 0;
}

async function ensureTagsExist(tagIds, userId) {
  if (!tagIds || tagIds.length === 0) return true;
  const { rows } = await pool.query("SELECT id FROM tags WHERE id = ANY($1::int[])", [tagIds]);
  return rows.length === tagIds.length;
}

async function replaceBookTags(client, bookId, tagIds) {
  if (tagIds === undefined) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS book_tags (
      book_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (book_id, tag_id)
    )
  `);
  await client.query("DELETE FROM book_tags WHERE book_id = $1", [bookId]);
  for (const tagId of tagIds) {
    await client.query("INSERT INTO book_tags (book_id, tag_id) VALUES ($1, $2)", [bookId, tagId]);
  }
}

function booksSelectSql(whereClause = "") {
  return `
    SELECT
      b.*,
      s.name AS shelf_name,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', t.id, 'name', t.name)
          ORDER BY t.name
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM books b
    LEFT JOIN shelves s ON s.id = b.shelf_id
    LEFT JOIN book_tags bt ON bt.book_id = b.id
    LEFT JOIN tags t ON t.id = bt.tag_id
    ${whereClause}
    GROUP BY b.id, s.name
  `;
}

function legacyBooksSelectSql(whereClause = "") {
  return `
    SELECT
      b.*,
      NULL AS shelf_name,
      '[]'::json AS tags
    FROM books b
    ${whereClause}
  `;
}

async function updateLegacyBook(id, body) {
  const fields = LEGACY_UPDATABLE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(body, field));

  if (fields.length > 0) {
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);
    setClauses.push("updated_at = NOW()");
    const values = fields.map((field) => {
      if (field === "title" || field === "author") return body[field].trim();
      if (field === "shelf_id") return body[field] === "" ? null : body[field];
      return body[field];
    });
    values.push(id);
    const { rowCount } = await pool.query(`UPDATE books SET ${setClauses.join(", ")} WHERE id = $${values.length}`, values);
    if (rowCount === 0) throw requestError("book not found", 404);
  }

  const { rows } = await pool.query(`${legacyBooksSelectSql("WHERE b.id = $1")}`, [id]);
  if (rows.length === 0) throw requestError("book not found", 404);
  return rows[0];
}

router.get("/", async (req, res) => {
  const { status, shelf_id, tag_id } = req.query;
  const where = [];
  const params = [];

  try {
    if (status) {
      if (!VALID_STATUSES.has(status)) return sendError(res, 400, "status must be one of want_to_read, reading, finished");
      params.push(status);
      where.push(`b.status = $${params.length}`);
    }

    const shelfId = parseOptionalId(shelf_id, "shelf_id");
    if (shelfId) {
      params.push(shelfId);
      where.push(`b.shelf_id = $${params.length}`);
    }

    const tagId = parseOptionalId(tag_id, "tag_id");
    if (tagId) {
      params.push(tagId);
      where.push(`EXISTS (SELECT 1 FROM book_tags bt_filter WHERE bt_filter.book_id = b.id AND bt_filter.tag_id = $${params.length})`);
    }

    const sql = `${booksSelectSql(where.length ? "WHERE " + where.join(" AND ") : "")} ORDER BY b.updated_at DESC`;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    if (/must be/.test(err.message)) return sendError(res, 400, err.message);
    if (err.code === "42P01") {
      try {
        const legacyWhere = [];
        const legacyParams = [];
        if (status) {
          legacyParams.push(status);
          legacyWhere.push(`b.status = $${legacyParams.length}`);
        }
        const legacySql = `${legacyBooksSelectSql(legacyWhere.length ? "WHERE " + legacyWhere.join(" AND ") : "")} ORDER BY b.updated_at DESC`;
        const { rows } = await pool.query(legacySql, legacyParams);
        return res.json(rows);
      } catch (legacyErr) {
        console.error(legacyErr);
      }
    }
    console.error(err);
    sendError(res, 500, "failed to fetch books");
  }
});

router.get("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  try {
    const { rows } = await pool.query(`${booksSelectSql("WHERE b.id = $1")}`, [id]);
    if (rows.length === 0) return sendError(res, 404, "book not found");
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "42P01") {
      try {
        const { rows } = await pool.query(`${legacyBooksSelectSql("WHERE b.id = $1")}`, [id]);
        if (rows.length === 0) return sendError(res, 404, "book not found");
        return res.json(rows[0]);
      } catch (legacyErr) {
        console.error(legacyErr);
      }
    }
    console.error(err);
    sendError(res, 500, "failed to fetch book");
  }
});

router.post("/", async (req, res) => {
  const { title, author, status, notes, started_at, finished_at } = req.body ?? {};
  const userId = req.body?.user_id ?? DEFAULT_USER_ID;

  if (!title || typeof title !== "string" || !title.trim()) return sendError(res, 400, "title is required");
  if (!author || typeof author !== "string" || !author.trim()) return sendError(res, 400, "author is required");
  if (!status || !VALID_STATUSES.has(status)) return sendError(res, 400, "status must be one of want_to_read, reading, finished");

  let shelfId;
  let tagIds;
  try {
    shelfId = parseOptionalId(req.body?.shelf_id, "shelf_id");
    tagIds = normalizeTagIds(req.body?.tag_ids) ?? [];
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!(await ensureUserExists(userId))) throw requestError("user does not exist");
    if (!(await ensureShelfExists(shelfId, userId))) throw requestError("shelf does not exist for this user");
    if (!(await ensureTagsExist(tagIds, userId))) throw requestError("one or more tags do not exist for this user");

    const { rows } = await client.query(
      `INSERT INTO books (user_id, shelf_id, title, author, status, notes, started_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, shelfId, title.trim(), author.trim(), status, notes ?? null, started_at ?? null, finished_at ?? null],
    );
    await replaceBookTags(client, rows[0].id, tagIds);
    await client.query("COMMIT");

    const { rows: created } = await pool.query(`${booksSelectSql("WHERE b.id = $1")}`, [rows[0].id]);
    res.status(201).json(created[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return sendError(res, err.status, err.message);
    console.error(err);
    sendError(res, 500, "failed to create book");
  } finally {
    client.release();
  }
});

router.patch("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const body = req.body ?? {};
  const fields = UPDATABLE_FIELDS.filter((f) => Object.prototype.hasOwnProperty.call(body, f));
  let tagIds;
  try {
    tagIds = normalizeTagIds(body.tag_ids);
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  if (fields.length === 0 && tagIds === undefined) return sendError(res, 400, "no updatable fields provided");
  if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) return sendError(res, 400, "title cannot be blank");
  if (body.author !== undefined && (typeof body.author !== "string" || !body.author.trim())) return sendError(res, 400, "author cannot be blank");
  if (body.status !== undefined && !VALID_STATUSES.has(body.status)) {
    return sendError(res, 400, "status must be one of want_to_read, reading, finished");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: existingRows } = await client.query("SELECT * FROM books WHERE id = $1", [id]);
    if (existingRows.length === 0) throw requestError("book not found", 404);

    const userId = body.user_id ?? existingRows[0].user_id ?? DEFAULT_USER_ID;
    const shelfId = Object.prototype.hasOwnProperty.call(body, "shelf_id") ? parseOptionalId(body.shelf_id, "shelf_id") : existingRows[0].shelf_id;

    if (!(await ensureUserExists(userId))) throw requestError("user does not exist");
    if (!(await ensureShelfExists(shelfId, userId))) throw requestError("shelf does not exist for this user");
    if (!(await ensureTagsExist(tagIds, userId))) throw requestError("one or more tags do not exist for this user");

    if (fields.length > 0) {
      const updateFields = [...fields];
      if (existingRows[0].user_id == null && !updateFields.includes("user_id")) updateFields.push("user_id");
      const setClauses = updateFields.map((f, i) => `${f} = $${i + 1}`);
      setClauses.push("updated_at = NOW()");
      const values = updateFields.map((f) => {
        if (f === "title" || f === "author") return body[f].trim();
        if (f === "shelf_id") return shelfId;
        if (f === "user_id") return userId;
        return body[f];
      });
      values.push(id);
      await client.query(`UPDATE books SET ${setClauses.join(", ")} WHERE id = $${values.length}`, values);
    }

    await replaceBookTags(client, id, tagIds);
    await client.query("COMMIT");

    const { rows } = await pool.query(`${booksSelectSql("WHERE b.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "42P01") {
      try {
        const updated = await updateLegacyBook(id, body);
        return res.json(updated);
      } catch (legacyErr) {
        if (legacyErr.status) return sendError(res, legacyErr.status, legacyErr.message);
        console.error(legacyErr);
      }
    }
    if (err.status) return sendError(res, err.status, err.message);
    if (/must be/.test(err.message)) return sendError(res, 400, err.message);
    console.error(err);
    sendError(res, 500, "failed to update book");
  } finally {
    client.release();
  }
});

router.delete("/:id", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  try {
    const { rowCount } = await pool.query("DELETE FROM books WHERE id = $1", [id]);
    if (rowCount === 0) return sendError(res, 404, "book not found");
    res.status(204).end();
  } catch (err) {
    console.error(err);
    sendError(res, 500, "failed to delete book");
  }
});

router.post("/:id/tags", async (req, res) => {
  let id;
  try {
    id = parseOptionalId(req.params.id, "id");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const tagId = req.body?.tag_id;
  if (!Number.isInteger(tagId) || tagId <= 0) return sendError(res, 400, "tag_id is required and must be a positive integer");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { rows: existingRows } = await client.query("SELECT * FROM books WHERE id = $1", [id]);
    if (existingRows.length === 0) throw requestError("book not found", 404);
    
    // Assume user is owner for this scope, or rely on ensureTagsExist
    const userId = existingRows[0].user_id ?? DEFAULT_USER_ID;
    if (!(await ensureTagsExist([tagId], userId))) throw requestError("tag does not exist", 404);

    await client.query(
      "INSERT INTO book_tags (book_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, tagId]
    );

    await client.query("COMMIT");
    
    const { rows } = await pool.query(`${booksSelectSql("WHERE b.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return sendError(res, err.status, err.message);
    console.error(err);
    sendError(res, 500, "failed to attach tag");
  } finally {
    client.release();
  }
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  let id, tagId;
  try {
    id = parseOptionalId(req.params.id, "id");
    tagId = parseOptionalId(req.params.tagId, "tagId");
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { rows: existingRows } = await client.query("SELECT * FROM books WHERE id = $1", [id]);
    if (existingRows.length === 0) throw requestError("book not found", 404);

    await client.query(
      "DELETE FROM book_tags WHERE book_id = $1 AND tag_id = $2",
      [id, tagId]
    );

    await client.query("COMMIT");
    
    const { rows } = await pool.query(`${booksSelectSql("WHERE b.id = $1")}`, [id]);
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return sendError(res, err.status, err.message);
    console.error(err);
    sendError(res, 500, "failed to detach tag");
  } finally {
    client.release();
  }
});

export default router;
