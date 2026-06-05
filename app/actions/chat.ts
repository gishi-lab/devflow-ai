"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatSession } from "@/types";

// ─── Type mapping ─────────────────────────────────────────────────────────────
//
// Supabase returns snake_case columns; we map to our camelCase app types.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSession(row: any): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    messages: [],           // messages are loaded separately on demand
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMessage(row: any): ChatMessage {
  return {
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    timestamp: row.created_at,
  };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Returns all chat sessions for the current user, ordered newest first.
 * RLS ensures only the user's own sessions are returned.
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toSession);
}

/**
 * Returns all messages for a specific session, oldest first (conversation order).
 * RLS prevents reading another user's messages.
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toMessage);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Creates a new chat session for the authenticated user.
 * The title is generated from the user's first message (truncated to 60 chars).
 */
export async function createChatSession(title: string): Promise<ChatSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user.id, title: title.trim() || "New Chat" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toSession(data);
}

// ─── SAVE EXCHANGE ────────────────────────────────────────────────────────────

/**
 * Persists one user message + one AI reply as a pair.
 * Called after the AI stream completes so we save the full response.
 * Also bumps the session's updated_at so it floats to the top of the list.
 */
export async function saveChatExchange(
  sessionId: string,
  userContent: string,
  assistantContent: string,
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  // Insert both messages in a single round-trip
  const { error: msgError } = await supabase.from("chat_messages").insert([
    {
      session_id: sessionId,
      user_id: user.id,
      role: "user",
      content: userContent,
    },
    {
      session_id: sessionId,
      user_id: user.id,
      role: "assistant",
      content: assistantContent,
    },
  ]);

  if (msgError) throw new Error(msgError.message);

  // Bump updated_at so this session rises to the top in getChatSessions()
  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Deletes a session and all its messages (via ON DELETE CASCADE).
 * RLS prevents deleting another user's sessions.
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
}
