# ReadWell

CodePath WEB103 Final Project

Designed and developed by: Kaleab Alemu, William Chi

🔗 Link to deployed app: https://readwell-gjoj.onrender.com

## About

### Description and Purpose

ReadWell is a personal reading tracker for people who want one calm place to manage books they own, want to read, or have finished. Users can organize titles on shelves, label them with tags, and see lightweight reading stats. The app exists to reduce scattered notes and spreadsheets so readers can decide what to read next and reflect on their habits.

### Inspiration

We all swap book recommendations constantly and lose track of titles across chats, screenshots, and bookstore photos. Apps like Goodreads inspired the idea of a structured library, but we wanted a smaller, focused tool we could fully own together for class—clear data model, obvious CRUD flows, and room for thoughtful extras (filters, modals) without trying to rebuild a social network.

## Tech Stack

Frontend: React, React Router, CSS

Backend: Node.js, Express, PostgreSQL

Auth: GitHub OAuth with Passport.js, express-session, connect-pg-simple

## Features

### ✅ Library dashboard

A home view that lists the user's books with key fields (title, author, status, shelf, tags) so they can scan their collection at a glance.

![Library dashboard GIF](./milestones/assets/library-dashboard.gif)

### ✅ Book management (full CRUD)

Create, read, update, and delete books through the UI backed by a RESTful API (GET, POST, PATCH, DELETE) so the library stays accurate over time.

![Book management GIF](./milestones/assets/book-management.gif)

### ✅ Shelves (one-to-many)

Readers can create named shelves and assign books to them. Filter the dashboard by shelf to see only those titles.

![Shelves GIF](./milestones/assets/shelves.gif)

### ✅ Tags (many-to-many)

Readers apply multiple tags to a book via the `book_tags` join table, then filter the dashboard by tag.

![Tags GIF](./milestones/assets/tags.gif)

### ✅ Filters and sorting *(custom)*

Filter books by status, shelf, or tag, and sort by title A-Z, author A-Z, or date updated, so large lists stay usable without extra navigation.

![Filters and sorting GIF](./milestones/assets/filters-sorting.gif)

### ✅ Quick-add and edit modal *(custom)*

Open a modal to add or edit a book—including creating new shelves and tags inline—without leaving the library page.

![Quick add / edit modal GIF](./milestones/assets/quick-add-edit-modal.gif)

### ✅ Reading snapshot panel

An on-page summary (counts by status, reading-mix bar chart, currently-reading card, percent finished) that updates after any change without a full page reload.

![Reading snapshot panel GIF](./milestones/assets/reading-snapshot.gif)

### ✅ Reset database

A documented reset script restores users, shelves, books, tags, and book-tag assignments to a known demo state.

![Reset database GIF](./milestones/assets/reset-db.gif)

### ✅ GitHub OAuth login *(stretch)*

Users sign in with GitHub before viewing the reading dashboard. Sessions are persisted in Postgres via `connect-pg-simple` so logins survive server restarts. Users can log out from the app header.

![GitHub OAuth GIF](./milestones/assets/github-oauth.gif)

### Reading groups ✅ *Implemented*

Club organizers can create lightweight reading groups and attach suggested books so friends can follow a shared plan alongside their personal library.

## Installation Instructions

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or Render)
- A GitHub OAuth App (for auth)

### Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env   # fill in your values (see below)
npm run db:reset       # drops, recreates, and seeds all tables
npm start              # API on http://localhost:3001
```

**Environment variables** — copy `.env.example` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default `3001`) |
| `DATABASE_URL` | Postgres connection string |
| `PGSSL` | Set `true` when connecting to Render Postgres |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | Full callback URL (e.g. `http://localhost:3001/api/auth/github/callback`) |
| `CLIENT_URL` | Frontend origin used for post-login redirect (e.g. `http://localhost:5173`) |

**npm scripts:**

| Script | What it does |
|---|---|
| `npm start` | Run the Express API on `PORT` |
| `npm run dev` | Same but with nodemon for auto-reload |
| `npm run db:migrate` | Create tables (non-destructive) |
| `npm run db:seed` | Insert sample rows |
| `npm run db:reset` | Drop, recreate, and reseed everything |

### API endpoints

**Books**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/books` | List all books. Supports `?status=`, `?shelf_id=`, `?tag_id=` |
| `GET` | `/api/books/:id` | One book with shelf name and tags |
| `POST` | `/api/books` | Create a book. Required: `title`, `author`, `status`. Optional: `shelf_id`, `tag_ids[]`, `notes` |
| `PATCH` | `/api/books/:id` | Update book fields and/or tag assignments |
| `DELETE` | `/api/books/:id` | Delete a book |

**Shelves**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/shelves` | List all shelves with `book_count` |
| `POST` | `/api/shelves` | Create a shelf. Required: `name`. Optional: `description` |

**Tags**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tags` | List all tags with `book_count` |
| `POST` | `/api/tags` | Create a tag. Required: `name` |

**Auth**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/github` | Redirect to GitHub OAuth |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/api/auth/me` | Returns current logged-in user or `null` |
| `POST` | `/api/auth/logout` | Clears session and logs out |
| `GET` | `/api/health` | Liveness check |

### Frontend (`client/`)

```bash
cd client
npm install
npm run dev   # Vite dev server on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `http://localhost:3001` automatically.

**Frontend routes:**

| Path | Description |
|---|---|
| `/` | Library dashboard — filtering, sorting, add/edit modal, delete |
| `/books/:id` | Book detail page |

### Render deployment

This repo includes a `render.yaml` Render Blueprint. Create a **web service** and a **Postgres database** on Render, then connect them.

**Build command:**
```
npm --prefix server install && npm --prefix client install && npm --prefix client run build
```

**Start command:**
```
cd server && npm start
```

**Required environment variables on Render** (set in the dashboard):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Auto-filled from Render Postgres (via Blueprint) |
| `PGSSL` | `true` |
| `SESSION_SECRET` | Long random string |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | `https://your-app.onrender.com/api/auth/github/callback` |
| `CLIENT_URL` | `https://your-app.onrender.com` |

**GitHub OAuth App settings** (github.com → Settings → Developer settings → OAuth Apps):

- **Homepage URL:** `https://your-app.onrender.com`
- **Authorization callback URL:** `https://your-app.onrender.com/api/auth/github/callback`

After the first deploy, seed the database from the Render shell:

```bash
cd server && npm run db:reset
```
