# Milestone 1

This document should be completed and submitted during **Unit 5** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Read and understand all required features
  - [x] Understand you **must** implement **all** baseline features and **two** custom features
- [x] In `readme.md`: update app name to your app's name
- [x] In `readme.md`: add all group members' names
- [x] In `readme.md`: complete the **Description and Purpose** section
- [x] In `readme.md`: complete the **Inspiration** section
- [x] In `readme.md`: list a name and description for all features (minimum 6 for full points) you intend to include in your app (in future units, you will check off features as you complete them and add GIFs demonstrating the features)
- [x] In `planning/user_stories.md`: add all user stories (minimum 10 for full points)
- [x] In `planning/user_stories.md`: use 1-3 unique user roles in your user stories
- [x] In this document, complete all three questions in the **Reflection** section below

## Reflection

### 1. What went well during this unit?

We all agreed on a single app concept early (**ReadWell**) that maps cleanly to the course baseline: a main “book” entity for full CRUD, shelves for a one-to-many shape, and tags through a join table for many-to-many. Translating that into user stories and a feature list felt straightforward once the data model direction was clear, and splitting roles into **Reader** and **Club organizer** helped us align on personal tracking and a small shared-plan layer without overbuilding a social app on paper.

### 2. What were some challenges your group faced in this unit?

The hardest part was **scope control**—it is easy to imagine chat, recommendations, or full accounts before we have Postgres and Express wired up. We all had to repeatedly ask whether a story was essential for the first shippable version. Aligning on meeting times and dividing doc edits among us also took coordination.

### 3. What additional support will you need in upcoming units as you continue to work on your final project?

We will all lean on course examples for **ERD design** and **REST route naming**, and on staff or section resources when we **deploy to Render** (environment variables, build commands, and serving the React app alongside the API). A short checklist for “database reset” and seed scripts would help us meet that baseline requirement without guessing. If we add validation for POST/PATCH, we want one clear pattern (shared middleware or schema checks) so all of us implement it the same way.
