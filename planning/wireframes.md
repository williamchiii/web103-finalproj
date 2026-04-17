# Wireframes

Reference the Wireframing final project guide in the course portal for more information about how to complete this deliverable.

## List of Pages

- ⭐ Library dashboard
- ⭐ Book detail / edit view
- ⭐ Shelves page
- ⭐ Reading group planner
- Tags management view
- First-time empty state / onboarding
- Shared quick-add modal (overlay launched from the dashboard)

These are intentionally low-fidelity layouts focused on information hierarchy, navigation, and CRUD actions.

## Wireframe 1: Library dashboard

```text
+----------------------------------------------------------------------------------+
| ReadWell | Library | Shelves | Groups | Search [ title / author ] | + Add Book  |
+----------------------------------------------------------------------------------+
| Snapshot: [Want to Read 12] [Reading 4] [Finished 28] [Updated This Week 6]      |
+---------------------------+------------------------------------------------------+
| Filters                   | My Library                                  Sort [v] |
| Status [All v]            +------------------------------------------------------+
| Shelf  [All v]            | Title            Author        Status   Shelf   Tags |
| Tag    [All v]            | Atomic Habits    James Clear   Finished Growth  habit|
|                           | Deep Work        Cal Newport   Reading  Focus   work |
| Shelves                   | Design of...     Don Norman    Want     UX      ui   |
| - All books               |                                                      |
| - Summer 2026             | [View] [Edit] [Delete] on each row                  |
| - Book Club               +------------------------------------------------------+
| - Favorites               | Quick-add / edit modal opens on top of this page    |
+---------------------------+------------------------------------------------------+
```

- Main scan view for the app.
- Combines baseline CRUD with custom filter/sort controls and the reading snapshot panel.
- Quick-add/edit modal keeps the user on this page for the fastest workflow.

## Wireframe 2: Book detail / edit view

```text
+------------------------------------------------------------------------------+
| <- Back to Library                                     Book Details          |
+------------------------+-----------------------------------------------------+
| [Cover / placeholder]  | Title: Atomic Habits                                 |
|                        | Author: James Clear                                  |
|                        | Status: [Finished v]      Shelf: [Growth v]          |
|                        | Tags: [habit] [self-help] [+ Add tag]                |
|                        | Started: [2026-01-08]   Finished: [2026-01-24]       |
+------------------------+-----------------------------------------------------+
| Notes / Reflection                                                          |
| ---------------------------------------------------------------------------  |
| "Short takeaways, favorite quote, and what to recommend to the group."      |
|                                                                             |
+------------------------------------------------------------------------------+
| [Save Changes]                        [Delete Book]        [Cancel]          |
+------------------------------------------------------------------------------+
```

- Serves as the "confirmation/detail" destination after creating a book.
- Gives the user one focused place to update metadata, shelf assignment, tags, and notes.

## Wireframe 3: Shelves page

```text
+--------------------------------------------------------------------------------+
| ReadWell | Shelves                                                              |
+---------------------------+----------------------------------------------------+
| Create Shelf              | Shelf: Summer 2026                                 |
| Name [______________]     | Description: beach reads and discussion picks      |
| Desc [______________]     +----------------------------------------------------+
| [Add Shelf]               | Books on this shelf                                |
|                           | - The Creative Act        Finished                 |
| All Shelves               | - Tomorrow, and Tomorrow Reading                  |
| > All Books (34)          | - Deep Work              Want to Read              |
| > Summer 2026 (8)         |                                                    |
| > Book Club (5)           | [Rename Shelf] [Delete Shelf]                      |
| > Favorites (6)           +----------------------------------------------------+
|                           | Reassign books via dropdown or drag/drop later     |
+---------------------------+----------------------------------------------------+
```

- Covers the one-to-many relationship between shelves and books.
- Gives shelves their own management space rather than hiding them inside the book form.

## Wireframe 4: Reading group planner

```text
+--------------------------------------------------------------------------------+
| ReadWell | Groups                                                               |
+----------------------------+---------------------------------------------------+
| My Groups                  | Group: Tuesday Night Book Club                    |
| + New Group                | Description: monthly nonfiction discussion         |
| - Tuesday Night Book Club  | Next meeting: Jul 16      Cadence: Monthly        |
| - Design Friends           +---------------------------------------------------+
|                            | Suggested Books                                   |
|                            | 1. The Creative Act      [Current Pick]           |
|                            | 2. Deep Work             [Set Current] [Remove]   |
|                            | 3. Thinking, Fast...     [Set Current] [Remove]   |
|                            +---------------------------------------------------+
|                            | Add suggested book [search existing library]      |
|                            | Group notes / prompt [_________________________]   |
|                            | [Save Group]                                      |
+----------------------------+---------------------------------------------------+
```

- Keeps the organizer feature lightweight: create a group, describe it, and attach suggested books.
- Reuses book data already in the library rather than creating a completely separate social feature set.
