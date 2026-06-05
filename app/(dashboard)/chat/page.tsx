import type { Metadata } from "next";
import { getChatSessions } from "@/app/actions/chat";
import { ChatClient } from "./ChatClient";

export const metadata: Metadata = {
  title: "AI Chat – DevFlow AI",
};

/**
 * Server Component — runs on the server, fetches the user's chat history,
 * then hands it to the interactive Client Component.
 *
 * Because data is fetched here (server-side):
 * - The sidebar loads with real sessions on the first paint — no loading spinner
 * - The Supabase service role key never touches the browser
 */
export default async function ChatPage() {
  const initialSessions = await getChatSessions();
  return <ChatClient initialSessions={initialSessions} />;
}
