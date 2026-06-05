"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import {
  getChatMessages,
  createChatSession,
  saveChatExchange,
  deleteChatSession,
} from "@/app/actions/chat";
import type { ChatMessage, ChatSession } from "@/types";

// ─── Local types ──────────────────────────────────────────────────────────────

/** Extends ChatMessage with a transient UI flag for the streaming cursor. */
interface DisplayMessage extends ChatMessage {
  isStreaming?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WELCOME: DisplayMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm DevFlow AI — your personal assistant for learning and building faster as a developer.\n\nYou can ask me about:\n• React, Next.js, TypeScript, Supabase\n• Debugging errors in your code\n• Programming concepts in plain English\n• Best practices and architecture tips\n\nWhat would you like to know?",
  timestamp: new Date().toISOString(),
};

const EXAMPLE_QUESTIONS = [
  "What is the difference between useState and useEffect?",
  "How do I fetch data from an API in Next.js?",
  "Explain what a REST API is in simple terms",
  "What is TypeScript and why should I use it?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Group sessions into labelled buckets: Today / Yesterday / Older.
 * Sorted newest-first within each group.
 */
function groupSessions(
  sessions: ChatSession[],
): { label: string; items: ChatSession[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86_400_000;

  const todayItems: ChatSession[] = [];
  const yesterdayItems: ChatSession[] = [];
  const olderItems: ChatSession[] = [];

  for (const s of sessions) {
    const t = new Date(s.updatedAt).getTime();
    if (t >= today) todayItems.push(s);
    else if (t >= yesterday) yesterdayItems.push(s);
    else olderItems.push(s);
  }

  const groups: { label: string; items: ChatSession[] }[] = [];
  if (todayItems.length) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (olderItems.length) groups.push({ label: "Older", items: olderItems });
  return groups;
}

/**
 * Lightweight markdown renderer:
 * handles fenced code blocks, inline code, **bold**, and line breaks.
 */
function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim();
      const code = lines.slice(lang ? 1 : 0).join("\n");
      return (
        <pre
          key={i}
          className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto my-2 leading-relaxed"
        >
          {lang && (
            <div className="text-slate-500 text-xs mb-2 font-mono">{lang}</div>
          )}
          <code>{code}</code>
        </pre>
      );
    }
    return (
      <span key={i}>
        {part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((seg, j) => {
          if (seg.startsWith("`") && seg.endsWith("`"))
            return (
              <code
                key={j}
                className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono"
              >
                {seg.slice(1, -1)}
              </code>
            );
          if (seg.startsWith("**") && seg.endsWith("**"))
            return <strong key={j}>{seg.slice(2, -2)}</strong>;
          return seg.split("\n").map((line, k, arr) => (
            <span key={k}>
              {line}
              {k < arr.length - 1 && <br />}
            </span>
          ));
        })}
      </span>
    );
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: DisplayMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-slate-800 text-slate-300 border border-slate-700"
        }`}
      >
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>

      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <div>
              {renderContent(msg.content)}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-slate-400 ml-0.5 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Skeleton placeholder shown while switching to an existing session. */
function MessageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
          <div
            className={`h-14 rounded-2xl bg-slate-200 ${i % 2 === 0 ? "w-48" : "w-64"}`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialSessions: ChatSession[];
}

export function ChatClient({ initialSessions }: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close mobile sidebar on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSidebar(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Session selection ──────────────────────────────────────────────────────
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) {
        setShowSidebar(false);
        return;
      }
      abortRef.current?.abort();
      setActiveSessionId(sessionId);
      setMessages([]);
      setIsLoadingMessages(true);
      setIsStreaming(false);
      setError(null);
      setShowSidebar(false);

      startTransition(async () => {
        try {
          const msgs = await getChatMessages(sessionId);
          setMessages(msgs);
        } catch {
          setError("Failed to load messages.");
        } finally {
          setIsLoadingMessages(false);
        }
      });
    },
    [activeSessionId],
  );

  // ── New chat ───────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveSessionId(null);
    setMessages([]);
    setIsStreaming(false);
    setError(null);
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      // Add user message to UI immediately
      const userMsg: DisplayMessage = {
        id: `local-user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Create a session if this is a new conversation
      let sessionId = activeSessionId;
      if (!sessionId) {
        try {
          const title =
            trimmed.slice(0, 60) + (trimmed.length > 60 ? "…" : "");
          const newSession = await createChatSession(title);
          sessionId = newSession.id;
          setActiveSessionId(sessionId);
          setSessions((prev) => [newSession, ...prev]);
        } catch {
          setError("Could not create chat session. Please try again.");
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }
      }

      // Add placeholder AI message (will fill in during streaming)
      const aiId = `local-ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        },
      ]);
      setIsStreaming(true);

      // Build conversation history to send to the API
      // (exclude our placeholder messages and the welcome message)
      const history = messages
        .filter((m) => m.id !== "welcome" && !m.id.startsWith("local-"))
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      history.push({ role: "user", content: trimmed });

      const controller = new AbortController();
      abortRef.current = controller;
      let fullResponse = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error((await response.text()) || `Error ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body from API");
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const token = decoder.decode(value, { stream: true });
          fullResponse += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId ? { ...m, content: m.content + token } : m,
            ),
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Failed to get AI response.");
          setMessages((prev) => prev.filter((m) => m.id !== aiId));
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, isStreaming: false } : m)),
        );
        setIsStreaming(false);
        abortRef.current = null;
      }

      // Persist the exchange to Supabase (best-effort — don't block the UI)
      if (fullResponse && sessionId) {
        try {
          await saveChatExchange(sessionId, trimmed, fullResponse);
          // Bubble the session to the top of the sidebar
          setSessions((prev) => {
            const found = prev.find((s) => s.id === sessionId);
            if (!found) return prev;
            const bumped = {
              ...found,
              updatedAt: new Date().toISOString(),
            };
            return [bumped, ...prev.filter((s) => s.id !== sessionId)];
          });
        } catch (saveErr) {
          // Non-blocking: the AI response was still useful even if save failed
          console.error("[ChatClient] Failed to save exchange:", saveErr);
        }
      }
    },
    [activeSessionId, isStreaming, messages],
  );

  // ── Delete session ─────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback(
    async (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      try {
        await deleteChatSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) handleNewChat();
      } catch {
        setError("Failed to delete session.");
      }
    },
    [activeSessionId, handleNewChat],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const stopStreaming = () => abortRef.current?.abort();

  // ── Derived ────────────────────────────────────────────────────────────────
  const sessionGroups = groupSessions(sessions);
  const showWelcome = messages.length === 0 && !isLoadingMessages;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen bg-slate-50 relative">

      {/* ── Mobile backdrop ── */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 flex flex-col bg-slate-900 text-slate-100
          transform transition-transform duration-200
          ${showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-700/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-100 flex-1">AI Chat</span>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
              transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {sessionGroups.length === 0 ? (
            <p className="text-slate-500 text-xs text-center px-4 pt-6">
              No conversations yet.
              <br />Start a new chat above.
            </p>
          ) : (
            sessionGroups.map((group) => (
              <div key={group.label}>
                <p className="text-slate-500 text-xs font-medium px-2 py-1.5 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`
                        w-full text-left group flex items-center gap-2 px-2 py-2 rounded-lg
                        text-sm transition-colors
                        ${
                          activeSessionId === session.id
                            ? "bg-slate-700 text-slate-100"
                            : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                        }
                      `}
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="flex-1 truncate text-xs">
                        {session.title}
                      </span>
                      {/* Delete button — only visible on hover */}
                      <span
                        role="button"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded
                          text-slate-500 hover:text-red-400 hover:bg-red-400/10
                          transition-all flex-shrink-0 cursor-pointer"
                        title="Delete chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ════════════════════ CHAT AREA ════════════════════ */}
      <main className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-slate-900 font-bold text-sm leading-tight truncate">
              {activeSessionId
                ? (sessions.find((s) => s.id === activeSessionId)?.title ?? "Chat")
                : "New Chat"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span className="text-slate-400 text-xs">
                {isStreaming ? "Thinking…" : "GPT-4o mini"}
              </span>
            </div>
          </div>

          {/* New Chat shortcut (desktop) */}
          <button
            onClick={handleNewChat}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
              text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs
              font-medium transition-all"
            title="New Chat"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-3 bg-red-50 border border-red-200
            text-red-700 text-sm px-4 py-3 rounded-xl flex-shrink-0">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-3xl w-full mx-auto">
          {isLoadingMessages ? (
            <MessageSkeleton />
          ) : showWelcome ? (
            <MessageBubble msg={WELCOME} />
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}

          {/* Typing indicator while waiting for the first token */}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example questions (new chat only) */}
        {showWelcome && !isStreaming && (
          <div className="px-4 pb-3 max-w-3xl w-full mx-auto flex-shrink-0">
            <p className="text-slate-400 text-xs mb-2 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-white border border-slate-200 hover:border-indigo-300
                    hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-xl transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pb-5 pt-2 max-w-3xl w-full mx-auto flex-shrink-0">
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm
            focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about development…"
              rows={1}
              disabled={isStreaming}
              className="w-full px-4 py-3.5 pr-12 bg-transparent text-slate-900
                placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed
                max-h-32 disabled:opacity-50"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
              }}
            />

            {isStreaming ? (
              <button
                onClick={stopStreaming}
                title="Stop generating"
                className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-slate-200
                  hover:bg-red-100 hover:text-red-500 text-slate-500
                  flex items-center justify-center transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                title="Send"
                className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-indigo-600
                  hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed
                  text-white flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-center text-slate-400 text-xs mt-2">
            <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-500 text-xs">Enter</kbd> to send
            {" · "}
            <kbd className="bg-slate-100 px-1 py-0.5 rounded text-slate-500 text-xs">Shift+Enter</kbd> for new line
          </p>
        </div>
      </main>
    </div>
  );
}
