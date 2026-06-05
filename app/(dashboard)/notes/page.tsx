import type { Metadata } from "next";
import { getNotes } from "@/app/actions/notes";
import { NotesClient } from "./NotesClient";

export const metadata: Metadata = {
  title: "Notes – DevFlow AI",
};

/**
 * Server Component — fetches notes from Supabase on the server so the first
 * paint already has real data (no loading spinner on initial load).
 */
export default async function NotesPage() {
  const initialNotes = await getNotes();
  return <NotesClient initialNotes={initialNotes} />;
}
