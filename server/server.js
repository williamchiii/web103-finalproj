import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configureAuth } from "./auth.js";
import authRouter from "./routes/auth.js";
import booksRouter from "./routes/books.js";
import shelvesRouter from "./routes/shelves.js";
import tagsRouter from "./routes/tags.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = new Set([clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || process.env.NODE_ENV === "production" || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "readwell-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);
configureAuth(app);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/shelves", shelvesRouter);
app.use("/api/tags", tagsRouter);

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
