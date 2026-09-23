import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * A Supabase client bound to this request's auth cookies, or `null` when the
 * project isn't configured. Create one per request; never share it.
 */
export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies. The proxy refreshes the
          // session before the page renders, so this is safe to ignore.
        }
      },
    },
  });
}
