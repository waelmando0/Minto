import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

/**
 * The browser's Supabase client, or `null` when the project isn't configured.
 * It keeps the session in the same cookies the server reads, so signing in
 * here makes /account work on the next request.
 */
export function getBrowserSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
