# Milestone 3

This document should be completed and submitted during **Unit 7** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

You will need to reference the GitHub Project Management guide in the course portal for more information about how to complete each of these steps.

- [x] In your repo, create a project board. 
  - *Please be sure to share your project board with the grading team's GitHub **codepathreview**. This is separate from your repository's sharing settings.*
- [x] In your repo, create at least 5 issues from the features on your feature list.
- [x] In your repo, update the status of issues in your project board.
- [x] In your repo, create a GitHub Milestone for each final project unit, corresponding to each of the 5 milestones in your `milestones/` directory. 
  - [x] Set the completion percentage of each milestone. The GitHub Milestone for this unit (Milestone 3 - Unit 7) should be 100% completed when you submit for full points.
- [ ] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [ ] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this documents, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

Our pitch landed clearly because the planning work from Units 5 and 6 gave us something concrete to present: 12 user stories split across a Reader and Club Organizer role, four wireframes covering the library dashboard, book detail view, shelves page, and reading group planner, and a finalized ERD with seven tables (users, shelves, books, tags, book_tags, reading_groups, reading_group_books). Turning that planning into GitHub artifacts was smooth — the feature list in `README.md` mapped almost one-to-one onto issues, and the ERD made it obvious which issues needed to be sequenced (books before shelves/tags, both before the dashboard). Team coordination also improved this week now that each person can self-assign from the project board instead of asking over Slack.

### 2. What were some challenges your group faced in this unit?

Coordinating a six-person team across feature ownership is still the hardest part. It is easy for two people to accidentally plan work that touches the same routes or the same React component, so we used the project board columns and milestone assignments to make those boundaries visible. Scoping the stretch "Reading groups" feature was also tricky — it introduces a second user role (Club Organizer) and depends on book CRUD already being stable, so we had to be honest that it may not ship. Finally, splitting the work between frontend and backend without blocking each other took some discussion; we decided the backend team would stub out response shapes early so the frontend could build against mock data while the real routes get wired up.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Yes — the Unit 7 sprint was the pitch, GitHub project setup, and the first wave of issues, and all of that is complete. What is not yet done is any feature code, which is expected since this unit is the setup unit. Our priority order for the next two sprints is: (1) Express + Postgres scaffolding with the `books` table and a reset/seed script, (2) the book CRUD REST API, (3) shelves with the one-to-many relationship, (4) tags with the `book_tags` join table, (5) the library dashboard React page plus the reading snapshot panel, (6) the two custom features (filters/sorting and the quick-add modal), and (7) reading groups last if we have time. Everything depends on the books table existing, so that is issue #1.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

The stretch "Reading groups" feature (organizer role, user stories 11 and 12) is the most at risk. It requires a second role in the data model, two additional tables (`reading_groups`, `reading_group_books`), and its own UI page, and none of it is blocking our baseline grade. If it is still incomplete going into the Final Milestone, we will cut it and keep only the Reader-side features. The quick-add/edit modal (custom #2) is the second at risk because it depends on the book CRUD API being stable and validated; if the API is late, we will fall back to a dedicated `/books/new` route instead of a modal and still satisfy the CRUD requirement. Filters/sorting (custom #1) is safer because it is a pure frontend transformation of data we already have.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

Three things specifically: (1) an Express + Postgres reference pattern for join tables — `book_tags` (many-to-many) and `reading_group_books` (many-to-many with extra columns) are both a step beyond what we have done in labs; (2) a React Router pattern for the quick-add modal so the URL reflects the modal state and deep links still work; and (3) a Render deployment walkthrough specifically for a React client plus Express API plus managed Postgres, including how to seed the production database the first time. Office hours or a Slack thread on any of these would unblock us meaningfully.
