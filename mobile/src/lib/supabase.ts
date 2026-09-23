import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Supabase is optional. With EXPO_PUBLIC_SUPABASE_URL and a client key set
 * (see mobile/.env.example), sign-in uses real email codes and data lives in
 * Postgres. Without them the app runs in demo mode on local mock data.
 *
 * The key is the project's publishable key (sb_publishable_…) or, on older
 * projects, the legacy anon key. Each must be read as a literal
 * `process.env.EXPO_PUBLIC_…` expression so Expo can inline it at build time.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/** The shared client, or null in demo mode. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    // Refresh tokens only while the app is in the foreground (Supabase's RN guidance).
    if (Platform.OS !== "web") {
      AppState.addEventListener("change", (state) => {
        if (state === "active") void client?.auth.startAutoRefresh();
        else void client?.auth.stopAutoRefresh();
      });
    }
  }
  return client;
}
