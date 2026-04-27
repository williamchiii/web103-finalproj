INSERT INTO users (github_id, name, email, avatar_url, role) VALUES
  ('demo-readwell', 'Maya Reader', 'maya@readwell.local', NULL, 'reader');

INSERT INTO shelves (user_id, name, description) VALUES
  (1, 'Current Reads', 'Books that are actively in progress.'),
  (1, 'Book Club Picks', 'Titles for upcoming group discussions.'),
  (1, 'Favorites', 'Finished books worth revisiting.'),
  (1, 'Next Up', 'Books waiting near the top of the list.'),
  (1, 'Deep Focus', 'Longer or more challenging reads.');

INSERT INTO tags (user_id, name) VALUES
  (1, 'fantasy'),
  (1, 'sci-fi'),
  (1, 'book club'),
  (1, 'short read'),
  (1, 'challenging'),
  (1, 'comfort read'),
  (1, 'nonfiction'),
  (1, 'literary');

INSERT INTO books (user_id, shelf_id, title, author, status, notes, started_at, finished_at) VALUES
  (1, 3, 'The Name of the Wind', 'Patrick Rothfuss', 'finished', 'First reread still holds up. Great voice and worldbuilding.', '2026-01-02', '2026-02-10'),
  (1, 1, 'Project Hail Mary', 'Andy Weir', 'reading', 'Halfway through and moving quickly. Great for quick evening sessions.', '2026-04-01', NULL),
  (1, 4, 'Klara and the Sun', 'Kazuo Ishiguro', 'want_to_read', 'Saving this for a quiet weekend.', NULL, NULL),
  (1, 3, 'A Psalm for the Wild-Built', 'Becky Chambers', 'finished', 'Short, gentle, and comforting.', '2026-03-15', '2026-03-20'),
  (1, 1, 'The Fifth Season', 'N. K. Jemisin', 'reading', 'Dense start, but the structure is getting very interesting.', '2026-04-10', NULL),
  (1, 5, 'Godel, Escher, Bach', 'Douglas Hofstadter', 'want_to_read', 'Long-term project for slow weekend mornings.', NULL, NULL),
  (1, 2, 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'want_to_read', 'Next book club option. Strong candidate for discussion.', NULL, NULL),
  (1, 2, 'Sea of Tranquility', 'Emily St. John Mandel', 'finished', 'Elegant structure and a strong ending.', '2026-02-20', '2026-03-03'),
  (1, 4, 'The Creative Act', 'Rick Rubin', 'want_to_read', 'Looks useful for creative routines and reflection.', NULL, NULL),
  (1, 1, 'Braiding Sweetgrass', 'Robin Wall Kimmerer', 'reading', 'Reading one essay at a time.', '2026-04-18', NULL),
  (1, 3, 'Piranesi', 'Susanna Clarke', 'finished', 'Atmospheric and precise. Worth recommending.', '2026-01-18', '2026-01-25'),
  (1, 5, 'The Dawn of Everything', 'David Graeber and David Wengrow', 'want_to_read', 'Big nonfiction read for later in the summer.', NULL, NULL);

INSERT INTO book_tags (book_id, tag_id) VALUES
  (1, 1),
  (1, 3),
  (2, 2),
  (2, 6),
  (3, 2),
  (3, 8),
  (4, 2),
  (4, 4),
  (4, 6),
  (5, 1),
  (5, 3),
  (5, 5),
  (6, 5),
  (6, 7),
  (7, 3),
  (7, 8),
  (8, 2),
  (8, 8),
  (9, 7),
  (9, 4),
  (10, 7),
  (10, 6),
  (11, 1),
  (11, 8),
  (12, 5),
  (12, 7);
