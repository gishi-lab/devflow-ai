"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Task, TaskPriority, TaskStatus } from "@/types";

// ─── Type mapping ────────────────────────────────────────────────────────────
//
// Supabase returns columns in snake_case (user_id, created_at, …).
// Our app uses camelCase (userId, createdAt, …).
// This helper converts one database row into our Task type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Returns all tasks owned by the currently authenticated user,
 * ordered newest first. RLS ensures only the user's own rows are returned.
 */
export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toTask);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Inserts a new task for the authenticated user and returns the saved record.
 * Always re-fetches `user.id` on the server — never trust the client with it.
 */
export async function createTask(input: {
  title: string;
  description?: string;
  priority: TaskPriority;
}): Promise<Task> {
  const supabase = await createClient();

  // Verify auth inside every Server Action — security best practice
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      status: "todo",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  return toTask(data);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Updates the status of a task. RLS automatically blocks any attempt
 * to update a task that doesn't belong to the current user.
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Permanently deletes a task. RLS prevents deleting another user's task.
 */
export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
