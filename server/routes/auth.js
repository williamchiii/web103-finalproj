import { Router } from "express";
import { passport } from "../auth.js";

const router = Router();

function clientRedirect(path = "/") {
  const base = process.env.CLIENT_URL || (process.env.NODE_ENV === "production" ? "/" : "http://localhost:5173");
  if (base === "/") return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: clientRedirect("/login?error=oauth_failed"),
  }),
  (_req, res) => {
    res.redirect(clientRedirect("/"));
  },
);

router.get("/me", (req, res) => {
  res.json({ user: req.user ?? null });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

export default router;
