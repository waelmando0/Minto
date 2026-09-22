import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Small key-value store for secrets such as the session token: Keychain /
 * Keystore on device, localStorage on web (where SecureStore is unavailable).
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        // Private mode or blocked storage: the session simply won't persist.
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        // Nothing stored.
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
