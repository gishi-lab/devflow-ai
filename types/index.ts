// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export type NoteCategory = "concept" | "snippet" | "glossary" | "other";

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Links ──────────────────────────────────────────────────────────────────

export type LinkCategory =
  | "documentation"
  | "tutorial"
  | "tool"
  | "article"
  | "github"
  | "other";

export interface SavedLink {
  id: string;
  userId: string;
  title: string;
  url: string;
  description?: string;
  category: LinkCategory;
  tags: string[];
  createdAt: string;
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
