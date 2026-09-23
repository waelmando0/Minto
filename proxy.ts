import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase session before signed-in pages render, so Server
 * Components (which can't write cookies) always see a valid access token.
 * The marketing pages don't read the session, so they skip this.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Verifies the token and refreshes it when it has expired.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/account/:path*"],
};
