import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";

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
  const titleInputRef = useRef(null);
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

      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
          <input
            ref={titleInputRef}
            disabled={saving}
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const modalOpen = searchParams.has("new") || searchParams.has("edit");
  const editingId = searchParams.get("edit");
  const editing = useMemo(() => {
    if (!editingId) return null;
    return books.find((b) => String(b.id) === String(editingId)) || null;
  }, [books, editingId]);

  function openNewModal() {
    setSearchParams({ new: "1" });
  }

  function openEditModal(book) {
    setSearchParams({ edit: String(book.id) });
  }

  function closeModal() {
    setSearchParams({});
  }
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
    navigate(`/books/${created.id}`);
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
        onAddBook={openNewModal}
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
            onEdit={openEditModal}
            onDelete={deleteBook}
          />
        ))}
      </ul>

      <BookFormModal
        open={modalOpen}
        shelves={shelves}
        tags={tags}
        initial={editing}
        onClose={closeModal}
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
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [bookData, tagsData] = await Promise.all([
          apiJson(`/api/books/${id}`),
          apiJson("/api/tags").catch(() => [])
        ]);
        setBook(bookData);
        setAvailableTags(tagsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function attachTag(tagId) {
    try {
      const updatedBook = await apiJson(`/api/books/${id}/tags`, {
        method: "POST",
        body: JSON.stringify({ tag_id: Number(tagId) })
      });
      setBook(updatedBook);
    } catch (err) {
      alert(err.message);
    }
  }

  async function detachTag(tagId) {
    try {
      const updatedBook = await apiJson(`/api/books/${id}/tags/${tagId}`, {
        method: "DELETE"
      });
      setBook(updatedBook);
    } catch (err) {
      alert(err.message);
    }
  }

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
            <dd>
              <div className="tag-list" style={{ marginBottom: "0.5rem" }}>
                {book.tags.length > 0 ? (
                  book.tags.map((tag) => (
                    <span key={tag.id} className="tag-chip" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "var(--surface-2, #374151)", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.875rem" }}>
                      {tag.name}
                      <button type="button" onClick={() => detachTag(tag.id)} aria-label={`Remove ${tag.name}`} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "0", display: "inline-flex", alignItems: "center" }}>
                        &times;
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="muted">No tags</span>
                )}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) attachTag(e.target.value);
                }}
                style={{ fontSize: "0.875rem", padding: "0.25rem" }}
              >
                <option value="" disabled>Add tag...</option>
                {availableTags
                  .filter((t) => !book.tags.some((bt) => bt.id === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </dd>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
