import { errorMessage } from "@/lib/remote";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/*
 * Passwordless sign-in: request a one-time code by email, then verify it.
 *
 * With Supabase configured this is Supabase Auth's email OTP. In demo mode it
 * is a mock that accepts DEMO_CODE, so the app works without a backend.
 */

export const CODE_LENGTH = 6;
/** Fixed code the demo accepts; the verify screen shows it only in demo mode. */
export const DEMO_CODE = "246810";

export const isDemoAuth = () => !isSupabaseConfigured();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like you@example.com.";
  return undefined;
}

export interface Session {
  token: string;
  email: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function requestCode(email: string, { delay = 600 } = {}): Promise<void> {
  const error = validateEmail(email);
  if (error) throw new Error(error);
  const supabase = getSupabase();
  if (supabase) {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (authError) throw new Error(errorMessage(authError, "Couldn't send the code. Try again."));
    return;
  }
  await wait(delay);
}

export async function verifyCode(email: string, code: string, { delay = 600 } = {}): Promise<Session> {
  if (code.length !== CODE_LENGTH) throw new Error(`Enter the ${CODE_LENGTH}-digit code.`);
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    if (error || !data.session) throw new Error("That code is invalid or has expired. Check your email and try again.");
    return { token: data.session.access_token, email: (data.session.user.email ?? email).trim().toLowerCase() };
  }
  await wait(delay);
  if (code !== DEMO_CODE) throw new Error("That code doesn't match. Check your email and try again.");
  return { token: `mock-${Date.now()}`, email: email.trim().toLowerCase() };
}
