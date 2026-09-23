"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  authErrorMessage,
  normalizeCode,
  validateCode,
  validateEmail,
  type LoginState,
} from "@/lib/login";
import { siteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOT_CONFIGURED = "Sign-in isn't available right now. Try again later or use the Minto app.";

/** Step 1: email a one-time code (and a sign-in link) to the address. */
export async function requestCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const error = validateEmail(email);
  if (error) return { status: "error", message: error, email };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };

  // The link in the email comes back to this deployment (previews included).
  const origin = (await headers()).get("origin") ?? siteUrl;
  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (authError) return { status: "error", message: authErrorMessage(authError), email };

  return { status: "success", email };
}

/** Step 2: check the code. On success the session cookies are set and we go to the account page. */
export async function verifyCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = normalizeCode(String(formData.get("code") ?? ""));
  const error = validateEmail(email) ?? validateCode(token);
  if (error) return { status: "error", message: error, email };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };

  const { error: authError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (authError) return { status: "error", message: authErrorMessage(authError), email };

  redirect("/account");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
