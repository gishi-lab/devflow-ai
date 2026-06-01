import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 * Call this inside a Client Component — each call returns a fresh client
 * backed by the same browser cookie store.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
