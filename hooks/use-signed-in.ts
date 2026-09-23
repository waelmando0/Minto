import * as React from "react";

// @supabase/ssr stores the session in `sb-<project>-auth-token` cookies
// (split into `.0`, `.1`… when large). They're readable from the page, so the
// navbar can tell whether someone is signed in without a server round trip.
const AUTH_COOKIE = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=[^;]/;

function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/**
 * Whether a Supabase session cookie is present. It's a hint for the UI only:
 * the account page verifies the session on the server. Always `false` during
 * server rendering so static pages stay static.
 */
export function useSignedIn() {
  return React.useSyncExternalStore(
    subscribe,
    () => AUTH_COOKIE.test(document.cookie),
    () => false,
  );
}
