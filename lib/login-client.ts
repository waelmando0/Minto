import {
  authErrorMessage,
  normalizeCode,
  validateCode,
  validateEmail,
  type LoginState,
} from "@/lib/login";
import { getBrowserSupabase } from "@/lib/supabase/client";

/*
 * Sign-in runs in the browser, not in a Server Action. Supabase Auth
 * rate-limits code requests and checks per IP address; called from the
 * server, every visitor would share the host's few IPs and one busy minute
 * would lock everyone out. From the browser, each visitor has their own limit.
 */

const NOT_CONFIGURED = "Sign-in isn't available right now. Try again later or use the Minto app.";

/** Step 1: email a one-time code (and a sign-in link) to the address. */
export async function requestCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const error = validateEmail(email);
  if (error) return { status: "error", message: error, email };

  const supabase = getBrowserSupabase();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };

  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      // The link in the email comes back to this deployment (previews included).
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) return { status: "error", message: authErrorMessage(authError), email };
  } catch (e) {
    return { status: "error", message: authErrorMessage(e instanceof Error ? e : {}), email };
  }
  return { status: "success", email };
}

/** Step 2: check the code. On success the session cookies are set and the account page opens. */
export async function verifyCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = normalizeCode(String(formData.get("code") ?? ""));
  const error = validateEmail(email) ?? validateCode(token);
  if (error) return { status: "error", message: error, email };

  const supabase = getBrowserSupabase();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };

  try {
    const { error: authError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (authError) return { status: "error", message: authErrorMessage(authError), email };
  } catch (e) {
    return { status: "error", message: authErrorMessage(e instanceof Error ? e : {}), email };
  }

  // A full load so the server renders /account with the new session cookies.
  window.location.assign(new URL("/account", window.location.origin));
  return { status: "success", email };
}
