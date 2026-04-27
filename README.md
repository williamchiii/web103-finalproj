# ReadWell

CodePath WEB103 Final Project

Designed and developed by:  Kaleab Alemu, William Chi

🔗 Link to deployed app: *Pending Render deployment. Add the live Render URL here after deployment.*

## About

### Description and Purpose

ReadWell is a personal reading tracker for people who want one calm place to manage books they own, want to read, or have finished. Users can organize titles on shelves, label them with tags, and see lightweight reading stats. The app exists to reduce scattered notes and spreadsheets so readers can decide what to read next and reflect on their habits.

### Inspiration

We all swap book recommendations constantly and lose track of titles across chats, screenshots, and bookstore photos. Apps like Goodreads inspired the idea of a structured library, but we wanted a smaller, focused tool we could fully own together for class—clear data model, obvious CRUD flows, and room for thoughtful extras (filters, modals) without trying to rebuild a social network.

## Tech Stack

Frontend: React, React Router, CSS

Backend: Node.js, Express, PostgreSQL

Auth: GitHub OAuth with Passport.js and cookie sessions

## Features

### ✅ Library dashboard

A home view that lists the user’s books with key fields (title, author, status, shelf, tags) so they can scan their collection at a glance.

![Library dashboard GIF](./milestones/assets/library-dashboard.gif)

### ✅ Book management (full CRUD)

Create, read, update, and delete books through the UI backed by a RESTful API (GET, POST, PATCH, DELETE) so the library stays accurate over time.

![Book management GIF](./milestones/assets/book-management.gif)

### ✅ Shelves (one-to-many)

Seeded shelves organize books into named collections. Readers can assign a book to a shelf and filter the dashboard by shelf.

![Shelves GIF](./milestones/assets/shelves.gif)

### ✅ Tags (many-to-many)

Readers apply multiple tags to a book using the `book_tags` join table between books and tags, then filter the dashboard by tag.

![Tags GIF](./milestones/assets/tags.gif)

### ✅ Filters and sorting *(custom)*

Filter books by status, shelf, or tag, and sort by title or date updated, so large lists stay usable without extra navigation.

![Filters and sorting GIF](./milestones/assets/filters-sorting.gif)

### ✅ Quick-add and edit modal *(custom)*

Open a slide-out or modal to add or edit a book without leaving the library page, keeping context while satisfying validation before save.

![Quick add / edit modal GIF](./milestones/assets/quick-add-edit-modal.gif)

### ✅ Reading snapshot panel

An on-page summary (counts by status, recent updates) that updates after changes without a full page navigation—supporting a smooth single-page experience.

![Reading snapshot panel GIF](./milestones/assets/reading-snapshot.gif)

### ✅ Reset database

A documented reset script restores users, shelves, books, tags, and book-tag assignments to a known demo state.

![Reset database GIF](./milestones/assets/reset-db.gif)

### ✅ GitHub OAuth login *(stretch)*

Users sign in with GitHub before viewing the reading dashboard, and can log out from the app header.

![GitHub OAuth GIF](./milestones/assets/github-oauth.gif)

### Reading groups *(organizer, not implemented)*

Club organizers can create lightweight reading groups and attach suggested books so friends can follow a shared plan alongside their personal library.

[gif goes here]

## Installation Instructions

### Backend (`server/`)

Requirements: Node.js 20+, access to a Postgres database (we use Render).

```bash
cd server
npm install
cp .env.example .env     # then edit .env to add your DATABASE_URL
npm run db:reset         # drops + recreates demo tables and seeds sample data
npm start                # API on http://localhost:3001
```

Available npm scripts:

| Script             | What it does                                          |
|--------------------|-------------------------------------------------------|
| `npm start`        | Run the Express API on `PORT` (default `3001`)        |
| `npm run dev`      | Same as `start` but with `node --watch` for reload    |
| `npm run db:migrate` | Apply `db/schema.sql` (create tables)               |
| `npm run db:seed`  | Insert sample rows from `db/seed.sql`                 |
| `npm run db:reset` | Drop, recreate, and reseed the database              |

### API endpoints

- `GET /api/books` — list all books. Supports `?status=want_to_read|reading|finished`, `?shelf_id=...`, and `?tag_id=...`
- `GET /api/books/:id` — one book with shelf and tag data
- `POST /api/books` — create (required: `title`, `author`, `status`; optional: `shelf_id`, `tag_ids`, `notes`)
- `PATCH /api/books/:id` — update book fields and tag assignments
- `DELETE /api/books/:id` — delete
- `GET /api/shelves` — list shelves
- `GET /api/tags` — list tags
- `GET /api/auth/github` — start GitHub OAuth
- `GET /api/auth/github/callback` — GitHub OAuth callback
- `GET /api/auth/me` — current logged-in user
- `POST /api/auth/logout` — log out
- `GET /api/health` — liveness check

### Frontend (`client/`)

Requirements: Node.js 20+

```bash
cd client
npm install
npm run dev
```

Frontend routes:

- `/` — library dashboard with filtering, sorting, add/edit modal, and delete actions
- `/books/:id` — book detail page (dynamic route)

### Render deployment

Use one Render web service plus one Render Postgres database.

This repo also includes `render.yaml` for Render Blueprint deployment.

Recommended web service settings:

- Root directory: repository root
- Build command: `npm --prefix server install && npm --prefix client install && npm --prefix client run build`
- Start command: `cd server && npm start`
- Environment variables:
  - `DATABASE_URL`: your Render Postgres internal connection string
  - `NODE_ENV`: `production`
  - `PGSSL`: `true`
  - `SESSION_SECRET`: long random string used to sign session cookies
  - `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
  - `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
  - `GITHUB_CALLBACK_URL`: `https://your-app.onrender.com/api/auth/github/callback`
  - `CLIENT_URL`: `https://your-app.onrender.com`

After creating the Postgres database and before recording the final demo, run the first production seed command from the Render shell:

```bash
cd server
npm run db:reset
```
