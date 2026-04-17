# Pitch Notes

This file is optional for submission, but it gives the team one shared draft to rehearse from before the Unit 7 pitch.

## Three-Minute Outline

1. **Problem (20-30 seconds)**  
   Readers track books across screenshots, notes apps, and text messages, which makes it hard to remember what they own, what they want to read next, and what they promised to read with friends.

2. **Solution (20-30 seconds)**  
   **ReadWell** is a calm personal reading tracker where users manage books, shelves, and tags in one place, then optionally create lightweight reading groups for shared picks.

3. **Core features (60-75 seconds)**  
   - Full CRUD for books through a React + Express + Postgres stack
   - Shelves for one-to-many organization
   - Tags through a many-to-many join table
   - Filters/sorting and a quick-add modal as custom features
   - Reading snapshot panel for useful at-a-glance stats

4. **Data model and technical plan (30-40 seconds)**  
   The main entities are users, books, shelves, tags, and reading groups. Books belong to a shelf, books and tags connect through a join table, and groups can attach suggested books for shared reading plans.

5. **Why this is a good final project (20-30 seconds)**  
   It cleanly covers the course baseline requirements, has room for custom features, and stays scoped enough for a team to build and deploy in the remaining weeks.

6. **Feedback request / close (15-20 seconds)**  
   We want feedback on whether our reading-group feature feels appropriately scoped and whether our dashboard layout makes the most important actions obvious.

## One-Paragraph Version

ReadWell is a personal reading tracker for people who want one clean place to manage books they own, want to read, or have finished. Our app centers on a library dashboard with full CRUD for books, shelves for organization, tags for flexible categorization, and custom usability features like filters, sorting, and a quick-add modal. We are also planning a lightweight reading-group feature where organizers can attach suggested books to a shared plan without building a full social network. Technically, the app uses React on the frontend, Express on the backend, and PostgreSQL for relational data, which gives us a strong fit for the course requirements while still leaving room for thoughtful extras.
