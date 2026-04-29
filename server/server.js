import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./config/database.js";
import { configureAuth } from "./auth.js";
import authRouter from "./routes/auth.js";
import booksRouter from "./routes/books.js";
import shelvesRouter from "./routes/shelves.js";
import tagsRouter from "./routes/tags.js";
import groupsRouter from "./routes/groups.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = new Set([clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isProduction || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(express.json());

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: isProduction
      ? new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: true })
      : undefined,
    secret: process.env.SESSION_SECRET || "readwell-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
  }),
);
configureAuth(app);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/shelves", shelvesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/groups", groupsRouter);

if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
} else {
  app.use((req, res) => res.status(404).json({ error: "not found" }));
}

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`ReadWell API listening on http://localhost:${port}`);
});
