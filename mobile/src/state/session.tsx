import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Session } from "@/lib/auth";
import { secureStorage } from "@/lib/storage";

const STORAGE_KEY = "minto.session";

type Status = "loading" | "signedOut" | "signedIn";

interface SessionContextValue {
  status: Status;
  session: Session | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Restores the saved session on launch and keeps it in secure storage. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
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
    await secureStorage.set(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await secureStorage.remove(STORAGE_KEY);
    setSession(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo(() => ({ status, session, signIn, signOut }), [status, session, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside <SessionProvider>");
  return context;
}
