import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { darkColors, lightColors, type Colors } from "@/theme/tokens";

export type ThemePreference = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

interface ThemeValue {
  scheme: Scheme;
  colors: Colors;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** False until the saved preference has been read, so the first frame isn't the wrong theme. */
  ready: boolean;
}

const STORAGE_KEY = "minto.theme";
const PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

const ThemeContext = createContext<ThemeValue>({
  scheme: "light",
  colors: lightColors,
  preference: "system",
  setPreference: () => {},
  ready: true,
});

/**
 * Resolves the saved preference (System / Light / Dark) against the OS
 * setting. The preference belongs to the device, not the account, so it also
 * applies on the sign-in screens and survives sign-out.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && PREFERENCES.includes(saved as ThemePreference)) setPreferenceState(saved as ThemePreference);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: Scheme = preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
  const value = useMemo(
    () => ({ scheme, colors: scheme === "dark" ? darkColors : lightColors, preference, setPreference, ready }),
    [scheme, preference, setPreference, ready],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  return useContext(ThemeContext).colors;
}

/**
 * Builds a component's styles from the active palette, once per scheme:
 *   const useStyles = makeStyles((colors) => ({ card: { backgroundColor: colors.surface } }));
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: Colors) => T) {
  const cache = new Map<Scheme, T>();
  return function useStyles(): T {
    const { scheme, colors } = useTheme();
    let styles = cache.get(scheme);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(scheme, styles);
    }
    return styles;
  };
}
