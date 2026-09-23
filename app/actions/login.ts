"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Signing in happens in the browser (lib/login-client.ts); signing out clears
// the session cookies on the server.
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
