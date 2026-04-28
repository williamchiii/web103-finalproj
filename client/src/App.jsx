import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const STATUS_LABELS = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
};
const BOOK_ACCENTS = ["#2563eb", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0f766e", "#be123c", "#4f46e5"];

async function apiJson(path, options = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
    ...options,
  });

  if (resp.status === 204) return null;
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner-row" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function Toast({ message, onDismiss }) {
  if (!message) return null;
  return (
    <button className="toast" type="button" onClick={onDismiss}>
      {message}
    </button>
  );
}

function loginUrl() {
  return `${API_BASE}/api/auth/github`;
}

function LoginPage() {
  return (
    <main className="page login-page">
      <section className="login-panel">
        <div>
          <p className="eyebrow">ReadWell</p>
          <h1>Sign in to your reading shelf.</h1>
          <p>Use GitHub OAuth to protect your library and keep your demo aligned with the final project stretch checklist.</p>
        </div>
        <a className="login-button" href={loginUrl()}>
          Continue with GitHub
        </a>
      </section>
    </main>
  );
}

function AuthLoadingPage() {
  return (
    <main className="page">
      <Spinner label="Checking sign in" />
    </main>
  );
}

function getBookAccent(book) {
  return BOOK_ACCENTS[Number(book.id || 0) % BOOK_ACCENTS.length];
}

function SnapshotPanel({ books }) {
  const stats = useMemo(
    () => ({
      total: books.length,
      reading: books.filter((book) => book.status === "reading").length,
      finished: books.filter((book) => book.status === "finished").length,
      wantToRead: books.filter((book) => book.status === "want_to_read").length,
    }),
    [books],
  );

  return (
    <section className="stats" aria-label="Reading snapshot">
      <article>
        <span>{stats.total}</span>
        <p>Total books</p>
      </article>
      <article>
        <span>{stats.reading}</span>
        <p>Reading</p>
      </article>
      <article>
        <span>{stats.finished}</span>
        <p>Finished</p>
      </article>
      <article>
        <span>{stats.wantToRead}</span>
        <p>Want to read</p>
      </article>
    </section>
  );
}

function HeroPanel({ books, onAddBook, user, onLogout }) {
  const activeBook = books.find((book) => book.status === "reading") ?? books[0];
  const finishedCount = books.filter((book) => book.status === "finished").length;
  const progress = books.length ? Math.round((finishedCount / books.length) * 100) : 0;
  const statusRows = [
    { label: "Finished", value: finishedCount, color: "#047857" },
    { label: "Reading", value: books.filter((book) => book.status === "reading").length, color: "#2563eb" },
    { label: "Want to read", value: books.filter((book) => book.status === "want_to_read").length, color: "#ea580c" },
  ];
  const totalBooks = Math.max(books.length, 1);

  return (
    <section className="hero-panel" aria-label="ReadWell overview">
      <div className="hero-copy">
        <p className="eyebrow">Personal reading tracker</p>
        <h1>Build a calmer, smarter reading shelf.</h1>
        <p>
          Track what you own, what you are reading now, and what deserves a spot in the next book club rotation.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={onAddBook}>
            Add book
          </button>
          <a href="#library">Browse library</a>
          <Link to="/groups">Reading Groups</Link>
        </div>
        <div className="account-bar">
          {user?.avatar_url && <img src={user.avatar_url} alt="" />}
          <span>{user?.name || "Signed in"}</span>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="status-chart">
          <div className="chart-header">
            <span>Reading mix</span>
            <strong>{books.length} books</strong>
          </div>
          {statusRows.map((row) => (
            <div className="status-row" key={row.label}>
              <div className="status-row-label">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
              <div className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    "--bar-color": row.color,
                    "--bar-width": `${Math.max((row.value / totalBooks) * 100, row.value ? 8 : 0)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="currently-reading">
          <span className="cover-mini" style={{ "--book-color": activeBook ? getBookAccent(activeBook) : BOOK_ACCENTS[0] }} />
          <div>
            <p>Currently reading</p>
            <strong>{activeBook?.title ?? "Add your first book"}</strong>
            <small>{activeBook?.author ?? "Start your ReadWell shelf"}</small>
          </div>
        </div>
        <div className="progress-card">
          <span>{progress}%</span>
          <p>finished in this demo library</p>
        </div>
      </div>
    </section>
  );
}

function FilterControls({ filters, shelves, tags, sort, onFilterChange, onSortChange, disabled }) {
  return (
    <section className="controls" aria-label="Library controls">
      <label>
        Status
        <select disabled={disabled} value={filters.status} onChange={(e) => onFilterChange("status", e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Shelf
        <select disabled={disabled} value={filters.shelf_id} onChange={(e) => onFilterChange("shelf_id", e.target.value)}>
          <option value="">All shelves</option>
          {shelves.map((shelf) => (
            <option key={shelf.id} value={shelf.id}>
              {shelf.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tag
        <select disabled={disabled} value={filters.tag_id} onChange={(e) => onFilterChange("tag_id", e.target.value)}>
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort
        <select disabled={disabled} value={sort} onChange={(e) => onSortChange(e.target.value)}>
          <option value="updated_desc">Recently updated</option>
          <option value="title_asc">Title A-Z</option>
          <option value="author_asc">Author A-Z</option>
        </select>
      </label>
    </section>
  );
}

function BookCard({ book, shelfName, onEdit, onDelete, busy }) {
  const bookTags = book.tags ?? [];
  return (
    <li className="book-card" style={{ "--book-color": getBookAccent(book) }}>
      <div className="book-cover" aria-hidden="true">
        <span>{book.title.slice(0, 1)}</span>
      </div>
      <div>
        <p className="eyebrow">{STATUS_LABELS[book.status]}</p>
        <h3>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="muted">{book.author}</p>
      </div>
      <p className="shelf-label">{book.shelf_name || shelfName || "No shelf"}</p>
      <div className="tag-list" aria-label={`${book.title} tags`}>
        {bookTags.length > 0 ? bookTags.map((tag) => <span key={tag.id}>{tag.name}</span>) : <span>No tags</span>}
      </div>
      <div className="row-actions">
        <button type="button" onClick={() => onEdit(book)} disabled={busy}>
          Edit
        </button>
        <button className="danger" type="button" onClick={() => onDelete(book.id)} disabled={busy}>
          Delete
        </button>
      </div>
    </li>
  );
}

function BookFormModal({ open, shelves, tags, initial, onClose, onSave, onCreateShelf, onCreateTag }) {
  const [form, setForm] = useState(defaultForm());
  const [newShelfName, setNewShelfName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(initial?.id);

  function defaultForm() {
    return {
      title: "",
      author: "",
      status: "want_to_read",
      shelf_id: "",
      notes: "",
      tag_ids: [],
    };
  }

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title ?? "",
        author: initial?.author ?? "",
        status: initial?.status ?? "want_to_read",
        shelf_id: initial?.shelf_id ?? "",
        notes: initial?.notes ?? "",
        tag_ids: initial?.tags?.map((tag) => tag.id) ?? [],
      });
      setNewShelfName("");
      setNewTagName("");
      setError("");
      setSaving(false);
      setCreatingShelf(false);
      setCreatingTag(false);
    }
  }, [open, initial]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleTag(tagId) {
    setForm((previous) => ({
      ...previous,
      tag_ids: previous.tag_ids.includes(tagId)
        ? previous.tag_ids.filter((id) => id !== tagId)
        : [...previous.tag_ids, tagId],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        author: form.author.trim(),
        shelf_id: form.shelf_id ? Number(form.shelf_id) : null,
        tag_ids: form.tag_ids,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateShelf() {
    if (!newShelfName.trim()) {
      setError("Shelf name is required");
      return;
    }

    setCreatingShelf(true);
    setError("");
    try {
      const shelf = await onCreateShelf(newShelfName.trim());
      setForm((previous) => ({ ...previous, shelf_id: String(shelf.id) }));
      setNewShelfName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingShelf(false);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) {
      setError("Tag name is required");
      return;
    }

    setCreatingTag(true);
    setError("");
    try {
      const tag = await onCreateTag(newTagName.trim());
      setForm((previous) => ({
        ...previous,
        tag_ids: previous.tag_ids.includes(tag.id) ? previous.tag_ids : [...previous.tag_ids, tag.id],
      }));
      setNewTagName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTag(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="book-form-title">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2 id="book-form-title">{isEditing ? "Edit book" : "Add book"}</h2>
          <button type="button" className="icon-button" onClick={onClose} disabled={saving} aria-label="Close">
            x
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <label>
          Title
          <input disabled={saving} required value={form.title} onChange={(e) => updateField("title", e.target.value)} />
        </label>
        <label>
          Author
          <input disabled={saving} required value={form.author} onChange={(e) => updateField("author", e.target.value)} />
        </label>
        <label>
          Status
          <select disabled={saving} value={form.status} onChange={(e) => updateField("status", e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Shelf
          <select disabled={saving} value={form.shelf_id} onChange={(e) => updateField("shelf_id", e.target.value)}>
            <option value="">No shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name}
              </option>
            ))}
          </select>
        </label>
        <div className="inline-create">
          <label>
            New shelf
            <input
              disabled={saving || creatingShelf}
              placeholder="Book club, Summer reads..."
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateShelf();
                }
              }}
            />
          </label>
          <button type="button" disabled={saving || creatingShelf} onClick={handleCreateShelf}>
            {creatingShelf ? "Adding..." : "Add shelf"}
          </button>
        </div>
        <fieldset disabled={saving}>
          <legend>Tags</legend>
          <div className="checkbox-grid">
            {tags.map((tag) => (
              <label key={tag.id}>
                <input type="checkbox" checked={form.tag_ids.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="inline-create">
          <label>
            New tag
            <input
              disabled={saving || creatingTag}
              placeholder="Fantasy, research, favorite..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
          </label>
          <button type="button" disabled={saving || creatingTag} onClick={handleCreateTag}>
            {creatingTag ? "Adding..." : "Add tag"}
          </button>
        </div>
        <label>
          Notes
          <textarea disabled={saving} rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LibraryPage({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyBookId, setBusyBookId] = useState(null);
  const [error, setError] = useState("");
  const [lookupNotice, setLookupNotice] = useState("");
  const [toast, setToast] = useState("");
  const [filters, setFilters] = useState({ status: "", shelf_id: "", tag_id: "" });
  const [sort, setSort] = useState("updated_desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localTagAssignments, setLocalTagAssignments] = useState({});

  const tagById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [String(tag.id), tag])),
    [tags],
  );

  function enrichBooksWithLocalTags(data, assignments = localTagAssignments) {
    return data.map((book) => {
      if (book.tags?.length) return book;
      const assignedTagIds = assignments[String(book.id)] ?? [];
      return {
        ...book,
        tags: assignedTagIds.map((tagId) => tagById[String(tagId)]).filter(Boolean),
      };
    });
  }

  async function loadLookups() {
    setLookupNotice("");
    const [shelvesResult, tagsResult] = await Promise.allSettled([apiJson("/api/shelves"), apiJson("/api/tags")]);
    if (shelvesResult.status === "fulfilled") setShelves(shelvesResult.value);
    if (tagsResult.status === "fulfilled") setTags(tagsResult.value);
    if (shelvesResult.status === "rejected" || tagsResult.status === "rejected") {
      setLookupNotice("Shelves or tags are unavailable until the database is reset with the latest schema.");
    }
  }

  async function loadBooks(nextFilters = filters, assignments = localTagAssignments) {
    setLoading(true);
    setError("");
    const qs = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) qs.set(key, value);
    });

    try {
      const data = await apiJson(`/api/books${qs.toString() ? `?${qs.toString()}` : ""}`);
      setBooks(enrichBooksWithLocalTags(data, assignments));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        await loadLookups();
        await loadBooks();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  const sortedBooks = useMemo(() => {
    const visibleBooks = books.filter((book) => {
      if (filters.shelf_id && String(book.shelf_id) !== String(filters.shelf_id)) return false;
      if (filters.tag_id && !(book.tags ?? []).some((tag) => String(tag.id) === String(filters.tag_id))) return false;
      return true;
    });
    const copy = [...visibleBooks];
    if (sort === "title_asc") return copy.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "author_asc") return copy.sort((a, b) => a.author.localeCompare(b.author));
    return copy.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [books, filters.shelf_id, filters.tag_id, sort]);
  const shelfNameById = useMemo(
    () => Object.fromEntries(shelves.map((shelf) => [String(shelf.id), shelf.name])),
    [shelves],
  );

  function handleFilterChange(field, value) {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    loadBooks(nextFilters);
  }

  async function createBook(payload) {
    const created = await apiJson("/api/books", { method: "POST", body: JSON.stringify(payload) });
    const nextAssignments = { ...localTagAssignments, [String(created.id)]: payload.tag_ids ?? [] };
    setLocalTagAssignments(nextAssignments);
    await loadBooks(filters, nextAssignments);
    setToast("Book added");
  }

  async function updateBook(payload) {
    await apiJson(`/api/books/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const nextAssignments = { ...localTagAssignments, [String(editing.id)]: payload.tag_ids ?? [] };
    setLocalTagAssignments(nextAssignments);
    setEditing(null);
    await loadBooks(filters, nextAssignments);
    setToast("Book updated");
  }

  async function createShelf(name) {
    const shelf = await apiJson("/api/shelves", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setShelves((previous) => {
      const withoutDuplicate = previous.filter((item) => item.id !== shelf.id);
      return [...withoutDuplicate, shelf].sort((a, b) => a.name.localeCompare(b.name));
    });
    loadLookups();
    setToast("Shelf added");
    return shelf;
  }

  async function createTag(name) {
    const tag = await apiJson("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setTags((previous) => {
      const withoutDuplicate = previous.filter((item) => item.id !== tag.id);
      return [...withoutDuplicate, tag].sort((a, b) => a.name.localeCompare(b.name));
    });
    loadLookups();
    setToast("Tag added");
    return tag;
  }

  async function deleteBook(id) {
    const ok = window.confirm("Delete this book?");
    if (!ok) return;
    setBusyBookId(id);
    setError("");
    try {
      await apiJson(`/api/books/${id}`, { method: "DELETE" });
      await loadBooks();
      setToast("Book deleted");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyBookId(null);
    }
  }

  return (
    <main className="page">
      <Toast message={toast} onDismiss={() => setToast("")} />
      <HeroPanel
        books={books}
        user={user}
        onLogout={onLogout}
        onAddBook={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <SnapshotPanel books={books} />

      <section className="library-section" id="library">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Your reading shelf</h2>
          </div>
          <p>{sortedBooks.length} books shown</p>
        </div>
        <FilterControls
          filters={filters}
          shelves={shelves}
          tags={tags}
          sort={sort}
          onFilterChange={handleFilterChange}
          onSortChange={setSort}
          disabled={loading}
        />
      </section>

      {loading && <Spinner label="Loading books" />}
      {lookupNotice && <p className="notice">{lookupNotice}</p>}
      {error && <p className="error">{error}</p>}

      {!loading && sortedBooks.length === 0 && <p className="empty-state">No books match these filters.</p>}

      <ul className="book-grid">
        {sortedBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            shelfName={shelfNameById[String(book.shelf_id)]}
            busy={busyBookId === book.id}
            onEdit={(selectedBook) => {
              setEditing(selectedBook);
              setModalOpen(true);
            }}
            onDelete={deleteBook}
          />
        ))}
      </ul>

      <BookFormModal
        open={modalOpen}
        shelves={shelves}
        tags={tags}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={editing ? updateBook : createBook}
        onCreateShelf={createShelf}
        onCreateTag={createTag}
      />
    </main>
  );
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      setError("");
      try {
        setBook(await apiJson(`/api/books/${id}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <Spinner label="Loading book" />
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="page detail-page">
        <button type="button" onClick={() => navigate("/")}>
          Back
        </button>
        <p className="error">{error || "Book not found"}</p>
      </main>
    );
  }

  return (
    <main className="page detail-page">
      <button type="button" onClick={() => navigate("/")}>
        Back
      </button>
      <article className="detail-panel">
        <div className="detail-layout">
          <div className="book-cover large-cover" style={{ "--book-color": getBookAccent(book) }} aria-hidden="true">
            <span>{book.title.slice(0, 1)}</span>
          </div>
          <div>
            <p className="eyebrow">{STATUS_LABELS[book.status]}</p>
            <h1>{book.title}</h1>
            <p className="muted">by {book.author}</p>
          </div>
        </div>
        <dl>
          <div>
            <dt>Shelf</dt>
            <dd>{book.shelf_name || "No shelf"}</dd>
          </div>
          <div>
            <dt>Tags</dt>
            <dd>{book.tags.length ? book.tags.map((tag) => tag.name).join(", ") : "No tags"}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{book.notes || "No notes yet"}</dd>
          </div>
        </dl>
      </article>
    </main>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirming }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onCancel} disabled={confirming} aria-label="Close">
            x
          </button>
        </div>
        <p style={{ margin: "1.5rem 0" }}>{message}</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button type="button" className="button outline" onClick={onCancel} disabled={confirming} style={{ background: "transparent", border: "1px solid var(--border)", color: "inherit", padding: "0.5rem 1rem", borderRadius: "0.25rem", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={confirming} style={{ background: "var(--danger, #dc2626)", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "0.25rem", cursor: "pointer" }}>
            {confirming ? "Working..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setGroups(await apiJson("/api/groups"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await apiJson("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      setGroups([created, ...groups]);
      setNewName("");
      setNewDesc("");
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiJson(`/api/groups/${deleteId}`, { method: "DELETE" });
      setGroups(groups.filter((g) => g.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Reading Groups</h1>
        <Link to="/" style={{ textDecoration: "none", color: "var(--text)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "var(--surface-1)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          &larr; Back to Library
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="detail-panel" style={{ marginBottom: "2rem" }}>
        <h2>Create a Group</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 200px" }}>
            Name
            <input value={newName} onChange={(e) => setNewName(e.target.value)} required disabled={creating} />
          </label>
          <label style={{ flex: "2 1 300px" }}>
            Description
            <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} disabled={creating} />
          </label>
          <button type="submit" disabled={creating || !newName.trim()}>
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
      </section>

      {loading ? (
        <Spinner label="Loading groups" />
      ) : groups.length === 0 ? (
        <p className="empty-state">No reading groups yet. Create one above!</p>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {groups.map((group) => (
            <article key={group.id} style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                  <Link to={`/groups/${group.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>📚 {group.name}</Link>
                </h2>
                <p className="muted" style={{ margin: "0.5rem 0 0", lineHeight: "1.4" }}>{group.description || "No description provided."}</p>
              </div>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--surface-2)" }}>
                <span className="muted" style={{ fontSize: "0.875rem" }}>
                  <strong>{group.books?.length || 0}</strong> suggested books
                </span>
                <button type="button" onClick={() => setDeleteId(group.id)} style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        confirming={deleting}
      />
    </main>
  );
}

function SuggestedBookCard({ book, onRemove }) {
  return (
    <li className="book-card" style={{ "--book-color": getBookAccent(book), position: "relative" }}>
      <div className="book-cover" aria-hidden="true">
        <span>{book.title.slice(0, 1)}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p className="eyebrow">{STATUS_LABELS[book.status] || book.status}</p>
        <h3 style={{ margin: "0.25rem 0" }}>{book.title}</h3>
        <p className="muted" style={{ fontSize: "0.875rem" }}>{book.author}</p>
      </div>
      <button 
        type="button" 
        onClick={() => onRemove(book.id)} 
        style={{ 
          background: "rgba(220, 38, 38, 0.1)", 
          color: "var(--danger)", 
          border: "1px solid var(--danger)", 
          borderRadius: "var(--radius)",
          padding: "0.25rem 0.75rem",
          fontSize: "0.75rem",
          cursor: "pointer",
          marginTop: "1rem"
        }}
      >
        Remove
      </button>
    </li>
  );
}

function GroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [groupData, booksData] = await Promise.all([
          apiJson(`/api/groups/${id}`),
          apiJson("/api/books")
        ]);
        setGroup(groupData);
        setAvailableBooks(booksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleAttach(e) {
    const bookId = e.target.value;
    if (!bookId) return;
    try {
      const updated = await apiJson(`/api/groups/${id}/books`, {
        method: "POST",
        body: JSON.stringify({ book_id: Number(bookId) })
      });
      setGroup(updated);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  }

  async function handleDetach(bookId) {
    try {
      const updated = await apiJson(`/api/groups/${id}/books/${bookId}`, {
        method: "DELETE"
      });
      setGroup(updated);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  }

  if (loading) return <main className="page"><Spinner label="Loading group" /></main>;
  if (error || !group) return <main className="page"><Link to="/groups">Back</Link><p className="error">{error || "Group not found"}</p></main>;

  return (
    <main className="page detail-page">
      <div className="page-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/groups" style={{ textDecoration: "none", color: "var(--text)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "var(--surface-1)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          &larr; Back to Groups
        </Link>
        <button type="button" onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setToast("Link copied to clipboard!");
          setTimeout(() => setToast(""), 3000);
        }} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          🔗 Share Group
        </button>
      </div>
      
      <article className="detail-panel" style={{ padding: "3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📚 {group.name}</h1>
          <p className="muted" style={{ fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>{group.description}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--surface-2)", paddingBottom: "1rem", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>Suggested Books ({group.books?.length || 0})</h2>
          <select value="" onChange={handleAttach} style={{ maxWidth: "300px", padding: "0.5rem 1rem", borderRadius: "2rem", border: "1px solid var(--border)", background: "var(--surface-1)", color: "inherit", fontWeight: "bold" }}>
            <option value="" disabled>+ Suggest a book...</option>
            {availableBooks
              .filter(b => !group.books?.some(gb => gb.id === b.id))
              .map(b => (
                <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
              ))}
          </select>
        </div>

        {group.books?.length === 0 ? (
          <p className="muted">No books suggested yet.</p>
        ) : (
          <ul className="book-grid" style={{ marginTop: "2rem" }}>
            {group.books.map((book) => (
              <SuggestedBookCard 
                key={book.id} 
                book={book} 
                onRemove={handleDetach} 
              />
            ))}
          </ul>
        )}
      </article>

      <Toast message={toast} onDismiss={() => setToast("")} />
    </main>
  );
}

export default function App() {
  const [authState, setAuthState] = useState({ loading: true, user: null });

  async function loadCurrentUser() {
    try {
      const data = await apiJson("/api/auth/me");
      setAuthState({ loading: false, user: data.user });
    } catch (_err) {
      setAuthState({ loading: false, user: null });
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function logout() {
    await apiJson("/api/auth/logout", { method: "POST" });
    setAuthState({ loading: false, user: null });
  }

  if (authState.loading) return <AuthLoadingPage />;
  if (!authState.user) return <LoginPage />;

  return (
    <Routes>
      <Route path="/" element={<LibraryPage user={authState.user} onLogout={logout} />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/groups/:id" element={<GroupDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
