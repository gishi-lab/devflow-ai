import type { Metadata } from "next";
import { getTasks } from "@/app/actions/tasks";
import { TasksClient } from "./TasksClient";

export const metadata: Metadata = {
  title: "Tasks – DevFlow AI",
};

/**
 * Server Component — runs on the server, fetches the initial list of tasks
 * from Supabase, then passes them to the interactive Client Component.
 *
 * Because this is a Server Component:
 * - The first page load is fast (data arrives with the HTML, no loading spinner)
 * - No API keys or Supabase URLs are exposed to the browser
 */
export default async function TasksPage() {
  const initialTasks = await getTasks();
  return <TasksClient initialTasks={initialTasks} />;
}
