/*
 * Supabase project settings for the website. Use the same project as the
 * mobile app. The key is the publishable key (sb_publishable_…) or, on older
 * projects, the legacy anon key: both are safe in the browser because row
 * level security limits every query to the signed-in user's rows. Never put a
 * secret or service_role key here.
 *
 * Each name must be read as a literal `process.env.NEXT_PUBLIC_…` expression
 * so Next.js can inline it into client code.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}
