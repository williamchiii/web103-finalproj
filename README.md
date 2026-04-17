# ReadWell

CodePath WEB103 Final Project

Designed and developed by: Adit Afnan, Kaleab Alemu, Osmani Hernandez, Olayinka Vaughan, Raymond Frimpong Amoateng, William Chi

🔗 Link to deployed app: *[Add your Render URL after deployment]*

## About

### Description and Purpose

ReadWell is a personal reading tracker for people who want one calm place to manage books they own, want to read, or have finished. Users can organize titles on shelves, label them with tags, and see lightweight reading stats. The app exists to reduce scattered notes and spreadsheets so readers can decide what to read next and reflect on their habits.

### Inspiration

We all swap book recommendations constantly and lose track of titles across chats, screenshots, and bookstore photos. Apps like Goodreads inspired the idea of a structured library, but we wanted a smaller, focused tool we could fully own together for class—clear data model, obvious CRUD flows, and room for thoughtful extras (filters, modals) without trying to rebuild a social network.

## Tech Stack

Frontend: React, React Router, CSS (planned layout: `client/`)

Backend: Node.js, Express, PostgreSQL (planned layout: `server/`)

## Features

### Library dashboard

A home view that lists the user’s books with key fields (title, author, status, shelf, tags) so they can scan their collection at a glance.

[gif goes here]

### Book management (full CRUD)

Create, read, update, and delete books through the UI backed by a RESTful API (GET, POST, PATCH, DELETE) so the library stays accurate over time.

[gif goes here]

### Shelves (one-to-many)

Readers create named shelves (for example “Summer 2026” or “Book club”) and assign each book to a shelf so organization stays simple and relational in Postgres.

[gif goes here]

### Tags (many-to-many)

Readers apply multiple tags to a book using a join table between books and tags so they can cross-cut topics without duplicating book rows.

[gif goes here]

### Filters and sorting *(custom)*

Filter books by status, shelf, or tag, and sort by title or date updated, so large lists stay usable without extra navigation.

[gif goes here]

### Quick-add and edit modal *(custom)*

Open a slide-out or modal to add or edit a book without leaving the library page, keeping context while satisfying validation before save.

[gif goes here]

### Reading snapshot panel

An on-page summary (counts by status, recent updates) that updates after changes without a full page navigation—supporting a smooth single-page experience.

[gif goes here]

### Reset database

A controlled way (for example an admin/seed route or documented script) to restore the database to a known default state for demos and development.

[gif goes here]

### Reading groups *(organizer)*

Club organizers can create lightweight reading groups and attach suggested books so friends can follow a shared plan alongside their personal library.

[gif goes here]

## Installation Instructions

The repository will gain a `client/` and `server/` folder during development. After those exist: install dependencies in each package, set `DATABASE_URL` (and any API base URL) in environment variables, run migrations and seed data, then start the Express API and the React dev server. These steps will be expanded with exact commands in the final README before submission.
