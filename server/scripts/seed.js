import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = await fs.readFile(path.join(__dirname, "..", "db", "seed.sql"), "utf8");
  await pool.query(sql);
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM books");
  console.log(`✓ seeded — books table now has ${rows[0].count} rows`);
  await pool.end();
}

run().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
