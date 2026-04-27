# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [x] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

We made strong progress on the core full-stack path for ReadWell. The Express API, Postgres schema, seed/reset scripts, and React dashboard came together around the same main entity: books. We also kept the UI focused on the workflows that matter most for the final demo: viewing books, adding a book, editing a book, deleting a book, filtering, sorting, and opening a dynamic detail route.

### 2. What were some challenges your group faced in this unit?

The biggest challenge was keeping the data model realistic while still meeting the required relationship features. Shelves and tags both touch the main book workflow, so we had to make sure they supported the dashboard without turning the app into a much larger social product. Another challenge was deployment planning, because the app needs the React build, Express server, and Postgres database to agree on environment variables.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

We completed the core sprint tasks needed to move from planning into a working product: backend CRUD, database reset/seed scripts, and the main React user flow. The remaining work was prioritized for the final milestone in this order: complete many-to-many tags, polish loading/error states, prepare Render deployment, and record final GIF walkthroughs.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

Reading groups remained the most at-risk feature because it adds another role and additional shared-planning screens. If it stays at risk, we will leave it unchecked and focus the submitted app on the Reader experience. The features required for the baseline grade are not at risk now because the app has a book CRUD workflow, shelves, tags, filters, a modal, dynamic routes, and reset scripts.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

The most useful support for the final milestone is deployment review: confirming Render build/start commands, setting the production `DATABASE_URL`, running the reset script against Render Postgres, and recording GIFs that clearly show every checked feature. We also want to review the feature checklist carefully so we only claim features that are implemented and visible in the walkthrough.
