"use client";

import { useOptimistic, useTransition, useState } from "react";
import { createNote, updateNote, deleteNote } from "@/app/actions/notes";
import type { Note, NoteCategory } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const categoryConfig: Record<
  NoteCategory,
  { label: string; color: string; bg: string }
> = {
  concept:  { label: "Concept",      color: "text-indigo-700", bg: "bg-indigo-50"  },
  snippet:  { label: "Code Snippet", color: "text-violet-700", bg: "bg-violet-50"  },
  glossary: { label: "Glossary",     color: "text-sky-700",    bg: "bg-sky-50"     },
  other:    { label: "Other",        color: "text-slate-600",  bg: "bg-slate-100"  },
};

// ─── Optimistic action types ──────────────────────────────────────────────────

type OptimisticAction =
  | { type: "add";    note: Note }
  | { type: "update"; note: Note }
  | { type: "delete"; id: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialNotes: Note[];
}

export function NotesClient({ initialNotes }: Props) {
  // ── Optimistic state ───────────────────────────────────────────────────────
  const [optimisticNotes, dispatch] = useOptimistic(
    initialNotes,
    (state: Note[], action: OptimisticAction): Note[] => {
      switch (action.type) {
        case "add":
          return [action.note, ...state];
        case "update":
          return state.map((n) => (n.id === action.note.id ? action.note : n));
        case "delete":
          return state.filter((n) => n.id !== action.id);
      }
    },
  );

  const [isPending, startTransition] = useTransition();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<NoteCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New note form state
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "concept" as NoteCategory,
    tags: "",
  });

  // Edit form state (populated when "Edit" is clicked in detail panel)
  const [editValues, setEditValues] = useState({
    title: "",
    content: "",
    category: "concept" as NoteCategory,
    tags: "",
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = optimisticNotes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const tempNote: Note = {
      id: `temp-${Date.now()}`,
      userId: "",
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      category: newNote.category,
      tags: parseTags(newNote.tags),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNewNote({ title: "", content: "", category: "concept", tags: "" });
    setShowForm(false);
    setError(null);

    startTransition(async () => {
      dispatch({ type: "add", note: tempNote });
      try {
        await createNote({
          title: tempNote.title,
          content: tempNote.content,
          category: tempNote.category,
          tags: tempNote.tags,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save note.");
      }
    });
  };

  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditValues({
      title: selectedNote.title,
      content: selectedNote.content,
      category: selectedNote.category,
      tags: selectedNote.tags.join(", "),
    });
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedNote || !editValues.title.trim() || !editValues.content.trim())
      return;

    const updated: Note = {
      ...selectedNote,
      title: editValues.title.trim(),
      content: editValues.content.trim(),
      category: editValues.category,
      tags: parseTags(editValues.tags),
      updatedAt: new Date().toISOString(),
    };

    setSelectedNote(updated);
    setIsEditing(false);
    setError(null);

    startTransition(async () => {
      dispatch({ type: "update", note: updated });
      try {
        await updateNote(selectedNote.id, {
          title: updated.title,
          content: updated.content,
          category: updated.category,
          tags: updated.tags,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update note.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (selectedNote?.id === id) setSelectedNote(null);
    setIsEditing(false);
    setError(null);

    startTransition(async () => {
      dispatch({ type: "delete", id });
      try {
        await deleteNote(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete note.");
      }
    });
  };

  const handleSelectNote = (note: Note) => {
    // Don't open a temp (saving…) note in the detail panel
    if (note.id.startsWith("temp-")) return;
    setSelectedNote(note);
    setShowForm(false);
    setIsEditing(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notes & Glossary</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {optimisticNotes.length} note{optimisticNotes.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSelectedNote(null); setIsEditing(false); }}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
            disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl
            transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200
          text-red-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex gap-6">

        {/* ══ LEFT: list ══ */}
        <div className="flex-1 min-w-0">

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200
                text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {(["all", "concept", "snippet", "glossary", "other"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {cat === "all" ? "All" : categoryConfig[cat].label}
              </button>
            ))}
          </div>

          {/* ── New note form ── */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
              <h3 className="text-slate-900 font-semibold text-sm mb-4">New Note</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                    text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                    focus:ring-indigo-500 text-sm"
                />
                <textarea
                  placeholder="Write your note, explanation, or code snippet..."
                  value={newNote.content}
                  onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                    text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                    focus:ring-indigo-500 text-sm font-mono resize-none"
                />
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={newNote.category}
                    onChange={(e) =>
                      setNewNote((p) => ({ ...p, category: e.target.value as NoteCategory }))
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                      text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {(Object.keys(categoryConfig) as NoteCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newNote.tags}
                    onChange={(e) => setNewNote((p) => ({ ...p, tags: e.target.value }))}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                      text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2
                      focus:ring-indigo-500 text-sm min-w-0"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600
                      hover:bg-slate-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500
                      text-white text-sm font-medium transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notes list ── */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No notes found.</p>
                <p className="text-slate-400 text-xs mt-1">
                  {search ? "Try a different search term." : "Click \"New Note\" to get started."}
                </p>
              </div>
            ) : (
              filtered.map((note) => {
                const isTemp = note.id.startsWith("temp-");
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`group bg-white rounded-2xl border px-5 py-4 transition-all
                      ${isTemp
                        ? "opacity-60 cursor-default"
                        : "cursor-pointer hover:border-slate-300 hover:shadow-sm"
                      }
                      ${selectedNote?.id === note.id
                        ? "border-indigo-300 ring-1 ring-indigo-300"
                        : "border-slate-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${categoryConfig[note.category].bg}
                              ${categoryConfig[note.category].color}`}
                          >
                            {categoryConfig[note.category].label}
                          </span>
                        </div>
                        <h3 className="text-slate-900 font-medium text-sm">
                          {note.title}
                          {isTemp && (
                            <span className="ml-2 text-xs text-slate-400 font-normal">saving…</span>
                          )}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                          {note.content}
                        </p>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {note.tags.map((tag) => (
                              <span key={tag} className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete (hidden until hover, disabled while saving) */}
                      {!isTemp && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                            hover:bg-red-50 text-slate-300 hover:text-red-400
                            transition-all flex-shrink-0"
                          title="Delete note"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: detail / edit panel ══ */}
        {selectedNote && (
          <div className="hidden lg:block w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">

              {isEditing ? (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <h3 className="text-slate-900 font-semibold text-sm mb-1">Edit Note</h3>
                  <input
                    type="text"
                    value={editValues.title}
                    onChange={(e) => setEditValues((p) => ({ ...p, title: e.target.value }))}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                      text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                  <textarea
                    value={editValues.content}
                    onChange={(e) => setEditValues((p) => ({ ...p, content: e.target.value }))}
                    rows={8}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200
                      text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500
                      text-sm font-mono resize-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editValues.category}
                      onChange={(e) =>
                        setEditValues((p) => ({ ...p, category: e.target.value as NoteCategory }))
                      }
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200
                        text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      {(Object.keys(categoryConfig) as NoteCategory[]).map((cat) => (
                        <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={editValues.tags}
                      onChange={(e) => setEditValues((p) => ({ ...p, tags: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200
                        text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2
                        focus:ring-indigo-500 text-sm min-w-0"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600
                        hover:bg-slate-50 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500
                        text-white text-sm font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${categoryConfig[selectedNote.category].bg}
                        ${categoryConfig[selectedNote.category].color}`}
                    >
                      {categoryConfig[selectedNote.category].label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleStartEdit}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600
                          hover:bg-indigo-50 transition-all"
                        title="Edit note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setSelectedNote(null); setIsEditing(false); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600
                          hover:bg-slate-100 transition-all"
                        title="Close"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-slate-900 font-bold text-lg mb-3">
                    {selectedNote.title}
                  </h2>

                  <pre className="text-slate-700 text-sm whitespace-pre-wrap font-mono
                    bg-slate-50 rounded-xl p-4 overflow-auto max-h-64">
                    {selectedNote.content}
                  </pre>

                  {selectedNote.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-4 flex-wrap">
                      {selectedNote.tags.map((tag) => (
                        <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-slate-400 text-xs mt-4">
                    Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
