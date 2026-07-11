import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for the browser (Client Components, hooks).
 * Safe to call repeatedly — createBrowserClient reuses a singleton
 * connection under the hood.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
