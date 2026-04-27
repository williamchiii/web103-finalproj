import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { pool } from "./config/database.js";

let userSchemaReady = false;

async function ensureUserSchema() {
  if (userSchemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      github_id TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'reader',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
  userSchemaReady = true;
}

function profileEmail(profile) {
  return profile.emails?.[0]?.value || `${profile.username || profile.id}@users.noreply.github.com`;
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar_url: row.avatar_url,
    role: row.role,
  };
}

async function findOrCreateGitHubUser(profile) {
  await ensureUserSchema();

  const githubId = String(profile.id);
  const name = profile.displayName || profile.username || "GitHub Reader";
  const email = profileEmail(profile);
  const avatarUrl = profile.photos?.[0]?.value ?? null;

  const { rows } = await pool.query(
    `INSERT INTO users (github_id, name, email, avatar_url, role)
     VALUES ($1, $2, $3, $4, 'reader')
     ON CONFLICT (email)
     DO UPDATE SET
       github_id = COALESCE(users.github_id, EXCLUDED.github_id),
       name = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url
     RETURNING *`,
    [githubId, name, email, avatarUrl],
  );

  return rows[0];
}

export function configureAuth(app) {
  const callbackURL =
    process.env.GITHUB_CALLBACK_URL ||
    `${process.env.PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 3001}`}/api/auth/github/callback`;

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL,
        scope: ["user:email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateGitHubUser(profile);
          done(null, publicUser(user));
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      await ensureUserSchema();
      const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      done(null, publicUser(rows[0]));
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

export { passport, publicUser };
