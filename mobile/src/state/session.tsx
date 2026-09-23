import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Session as SupabaseSession } from "@supabase/supabase-js";

import type { Session } from "@/lib/auth";
import { remoteDeleteAccount } from "@/lib/remote";
import { secureStorage } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase";

const fromSupabase = (s: SupabaseSession): Session => ({
  token: s.access_token,
  email: (s.user.email ?? "").toLowerCase(),
});

const STORAGE_KEY = "minto.session";

type Status = "loading" | "signedOut" | "signedIn";

interface SessionContextValue {
  status: Status;
  session: Session | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  /** Supabase only: permanently deletes the account and its data, then signs out. */
  deleteAccount?: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Restores the session on launch. With Supabase configured, the session is
 * Supabase Auth's own (kept fresh by its client); in demo mode it is a mock
 * token kept in secure storage.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (cancelled) return;
          setSession(data.session ? fromSupabase(data.session) : null);
          setStatus(data.session ? "signedIn" : "signedOut");
        })
        .catch(() => !cancelled && setStatus("signedOut"));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
        if (cancelled) return;
        setSession(next ? fromSupabase(next) : null);
        setStatus(next ? "signedIn" : "signedOut");
      });
      return () => {
        cancelled = true;
        listener.subscription.unsubscribe();
      };
    }

    secureStorage
      .get(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        const saved = raw ? (JSON.parse(raw) as Session) : null;
        setSession(saved);
        setStatus(saved ? "signedIn" : "signedOut");
      })
      .catch(() => !cancelled && setStatus("signedOut"));
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (next: Session) => {
    // With Supabase, verifyOtp has already stored the real session.
    if (!getSupabase()) await secureStorage.set(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    else await secureStorage.remove(STORAGE_KEY);
    setSession(null);
    setStatus("signedOut");
  }, []);

  const deleteAccount = useMemo(() => {
    const supabase = getSupabase();
    if (!supabase) return undefined;
    return async () => {
      await remoteDeleteAccount(supabase);
      // The user no longer exists on the server, so only clear this device.
      await supabase.auth.signOut({ scope: "local" });
      setSession(null);
      setStatus("signedOut");
    };
  }, []);

  const value = useMemo(
    () => ({ status, session, signIn, signOut, deleteAccount }),
    [status, session, signIn, signOut, deleteAccount],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside <SessionProvider>");
  return context;
}
