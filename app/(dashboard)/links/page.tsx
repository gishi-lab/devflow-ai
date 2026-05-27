"use client";

import { useState } from "react";

type LinkCategory = "documentation" | "tutorial" | "tool" | "article" | "github" | "other";

interface SavedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: LinkCategory;
  tags: string[];
  createdAt: string;
}

const categoryConfig: Record<LinkCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  documentation: {
    label: "Docs",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  tutorial: {
    label: "Tutorial",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  tool: {
    label: "Tool",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  article: {
    label: "Article",
    color: "text-sky-700",
    bg: "bg-sky-50",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  },
  github: {
    label: "GitHub",
    color: "text-slate-700",
    bg: "bg-slate-100",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>,
  },
  other: {
    label: "Other",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  },
};

const INITIAL_LINKS: SavedLink[] = [
  {
    id: "1",
    title: "Next.js Documentation",
    url: "https://nextjs.org/docs",
    description: "Official Next.js docs — App Router, routing, data fetching, and more.",
    category: "documentation",
    tags: ["nextjs", "react", "must-read"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Utility-first CSS framework. Great for rapid UI development.",
    category: "tool",
    tags: ["css", "tailwind", "styling"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Supabase Quickstart",
    url: "https://supabase.com/docs/guides/getting-started",
    description: "Get started with Supabase auth and database in minutes.",
    category: "tutorial",
    tags: ["supabase", "database", "auth"],
    createdAt: new Date().toISOString(),
  },
];

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function LinksPage() {
  const [links, setLinks] = useState<SavedLink[]>(INITIAL_LINKS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<LinkCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "other" as LinkCategory,
    tags: "",
  });

  const filtered = links.filter((l) => {
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || "").toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "all" || l.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    const url = newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`;
    setLinks((prev) => [
      {
        id: Date.now().toString(),
        title: newLink.title.trim(),
        url,
        description: newLink.description.trim() || undefined,
        category: newLink.category,
        tags: newLink.tags.split(",").map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewLink({ title: "", url: "", description: "", category: "other", tags: "" });
    setShowForm(false);
  };

  const deleteLink = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Links Library</h1>
          <p className="text-slate-500 mt-1 text-sm">{links.length} saved resources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save Link
        </button>
      </div>

      {/* New link form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold text-sm mb-4">Save New Link</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title..."
              value={newLink.title}
              onChange={(e) => setNewLink((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              autoFocus
            />
            <input
              type="url"
              placeholder="https://..."
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newLink.description}
              onChange={(e) => setNewLink((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div className="flex gap-3">
              <select
                value={newLink.category}
                onChange={(e) => setNewLink((p) => ({ ...p, category: e.target.value as LinkCategory }))}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {(Object.keys(categoryConfig) as LinkCategory[]).map((cat) => (
                  <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newLink.tags}
                onChange={(e) => setNewLink((p) => ({ ...p, tags: e.target.value }))}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium">
                Cancel
              </button>
              <button onClick={addLink} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & filters */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        {(["all", "documentation", "tutorial", "tool", "article", "github", "other"] as const).map((cat) => (
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

      {/* Links grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No links found.</p>
          <p className="text-slate-400 text-xs mt-1">Save your first resource!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((link) => (
            <div
              key={link.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${categoryConfig[link.category].bg} ${categoryConfig[link.category].color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {categoryConfig[link.category].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 font-medium text-sm hover:text-indigo-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.title}
                    </a>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-slate-400 text-xs truncate">{getDomain(link.url)}</span>
                  </div>
                  {link.description && (
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">{link.description}</p>
                  )}
                  {link.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {link.tags.map((tag) => (
                        <span key={tag} className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
