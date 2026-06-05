"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteCategory } from "@/types";

// ─── Type mapping ─────────────────────────────────────────────────────────────
//
// Supabase returns snake_case columns and native Postgres arrays for `tags`.
// We map them to our camelCase Note type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNote(row: any): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    category: row.category as NoteCategory,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all notes for the authenticated user, newest first.
 * RLS ensures only the user's own rows are returned.
 */
export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toNote);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Insert a new note and return the saved record (with real UUID + timestamps).
 */
export async function createNote(input: {
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
}): Promise<Note> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      tags: input.tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  return toNote(data);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Update an existing note's fields and return the updated record.
 * RLS prevents updating another user's notes.
 */
export async function updateNote(
  id: string,
  input: {
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
  },
): Promise<Note> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .update({
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      tags: input.tags,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  return toNote(data);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Delete a note. RLS prevents deleting another user's notes.
 */
export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
