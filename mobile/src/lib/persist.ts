import AsyncStorage from "@react-native-async-storage/async-storage";

import { initialGoals } from "@/data/goals";
import type { AppState } from "@/state/app-state";

/*
 * Saves the in-app data (balances, transactions, preferences) per signed-in
 * account so it survives restarts. Bump VERSION when AppState changes shape
 * and add a step to `migrate`; anything that can't be migrated is ignored
 * instead of crashing the app.
 */
const VERSION = 2;

interface Saved {
  version: number;
  state: AppState;
}

/** One key per account; the version lives inside the payload so saves can be migrated. */
export const storageKey = (email: string) => `minto.state:${email.trim().toLowerCase()}`;

/** Where v1 builds saved data; read once for migration, removed on sign-out. */
const legacyKey = (email: string) => `minto.state.v1:${email.trim().toLowerCase()}`;

/** Upgrades older saves to the current shape. */
function migrate(version: number, state: Record<string, unknown>): Record<string, unknown> | null {
  let current = { ...state };
  if (version < 1 || version > VERSION) return null;
  if (version < 2) current = { ...current, goals: initialGoals }; // v2 added savings goals
  return current;
}

/** Accepts only data that looks like a current AppState. */
export function parseSaved(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as Partial<Saved>;
    if (typeof saved.version !== "number" || !saved.state) return null;
    const state = migrate(saved.version, saved.state as unknown as Record<string, unknown>) as AppState | null;
    if (!state) return null;
    const valid =
      Array.isArray(state.accounts) &&
      Array.isArray(state.transactions) &&
      typeof state.investmentCash === "number" &&
      typeof state.balanceHidden === "boolean" &&
      typeof state.paymentMethodId === "string" &&
      Array.isArray(state.goals) &&
      state.accounts.every((a) => typeof a?.id === "string" && typeof a?.balance === "number") &&
      state.transactions.every((t) => typeof t?.id === "string" && typeof t?.amount === "number") &&
      state.goals.every((g) => typeof g?.id === "string" && typeof g?.target === "number" && typeof g?.saved === "number");
    return valid ? state : null;
  } catch {
    return null;
  }
}

export async function loadState(email: string): Promise<AppState | null> {
  try {
    const current = await AsyncStorage.getItem(storageKey(email));
    return parseSaved(current ?? (await AsyncStorage.getItem(legacyKey(email))));
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
    await AsyncStorage.multiRemove([storageKey(email), legacyKey(email)]);
  } catch {
    // Nothing to clear.
  }
}
