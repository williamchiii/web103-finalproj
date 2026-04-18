import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = await fs.readFile(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("✓ schema applied");
  await pool.end();
}

run().catch((err) => {
  console.error("migrate failed:", err);
  process.exit(1);
});
