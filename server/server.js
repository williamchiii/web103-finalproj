import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import booksRouter from "./routes/books.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/books", booksRouter);

app.use((req, res) => res.status(404).json({ error: "not found" }));

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`ReadWell API listening on http://localhost:${port}`);
});
