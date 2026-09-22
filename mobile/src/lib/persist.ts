import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppState } from "@/state/app-state";

/*
 * Saves the in-app data (balances, transactions, preferences) per signed-in
 * account so it survives restarts. Bump VERSION when AppState changes shape:
 * older saves are then ignored instead of crashing the app.
 */
const VERSION = 1;

interface Saved {
  version: number;
  state: AppState;
}

export const storageKey = (email: string) => `minto.state.v${VERSION}:${email.trim().toLowerCase()}`;

/** Accepts only data that looks like a current AppState. */
export function parseSaved(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as Partial<Saved>;
    const state = saved.state;
    if (saved.version !== VERSION || !state) return null;
    const valid =
      Array.isArray(state.accounts) &&
      Array.isArray(state.transactions) &&
      typeof state.investmentCash === "number" &&
      typeof state.balanceHidden === "boolean" &&
      typeof state.paymentMethodId === "string" &&
      state.accounts.every((a) => typeof a?.id === "string" && typeof a?.balance === "number") &&
      state.transactions.every((t) => typeof t?.id === "string" && typeof t?.amount === "number");
    return valid ? state : null;
  } catch {
    return null;
  }
}

export async function loadState(email: string): Promise<AppState | null> {
  try {
    return parseSaved(await AsyncStorage.getItem(storageKey(email)));
  } catch {
    return null;
  }
}

export async function saveState(email: string, state: AppState): Promise<void> {
  const saved: Saved = { version: VERSION, state };
  try {
    await AsyncStorage.setItem(storageKey(email), JSON.stringify(saved));
  } catch {
    // Storage full or unavailable: keep working in memory.
  }
}

export async function clearState(email: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(email));
  } catch {
    // Nothing to clear.
  }
}
