import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  accounts as initialAccounts,
  investmentCash as initialInvestmentCash,
  paymentMethods,
  transactions as initialTransactions,
  type Account,
  type AccountId,
  type Transaction,
  type TransferKind,
} from "@/data/mock";
import { initialGoals, type Goal, type GoalTemplateId } from "@/data/goals";
import { clearState, loadState, saveState } from "@/lib/persist";
import {
  errorMessage,
  fetchSnapshot,
  remoteCloseGoal,
  remoteCreateGoal,
  remoteTransfer,
  type RemoteSnapshot,
} from "@/lib/remote";
import { getSupabase } from "@/lib/supabase";
import { useSession } from "@/state/session";

export interface AppState {
  accounts: Account[];
  investmentCash: number;
  transactions: Transaction[];
  balanceHidden: boolean;
  paymentMethodId: string;
  goals: Goal[];
  /** Name shown in the app; comes from the Supabase profile when connected. */
  displayName?: string;
}

export type AppAction =
  | { type: "hydrate"; state: AppState }
  | { type: "reset" }
  /** Replaces server-owned data with a fresh snapshot, keeping device preferences. */
  | { type: "sync"; snapshot: RemoteSnapshot }
  | { type: "toggleBalance" }
  | { type: "selectPaymentMethod"; id: string }
  | { type: "transfer"; kind: TransferKind; amount: number; counterparty?: string; goalId?: string; now?: Date }
  | { type: "createGoal"; goal: Goal }
  | { type: "deleteGoal"; id: string; now?: Date };

export const initialState: AppState = {
  accounts: initialAccounts,
  investmentCash: initialInvestmentCash,
  transactions: initialTransactions,
  balanceHidden: false,
  paymentMethodId: paymentMethods[0].id,
  goals: initialGoals,
};

/** What each transfer does to balances, and how it is recorded. */
export const transferConfig: Record<
  TransferKind,
  { title: string; verb: string; account: AccountId; sign: 1 | -1; cash: 1 | -1 | 0; merchant: string }
> = {
  send: { title: "Send money", verb: "Send", account: "personal", sign: -1, cash: 0, merchant: "Transfer" },
  topup: { title: "Top up", verb: "Top up", account: "personal", sign: 1, cash: 0, merchant: "Top up" },
  deposit: { title: "Deposit to investing", verb: "Deposit", account: "personal", sign: -1, cash: 1, merchant: "Investment cash" },
  withdraw: { title: "Withdraw cash", verb: "Withdraw", account: "personal", sign: 1, cash: -1, merchant: "Investment cash" },
  goal: { title: "Add to goal", verb: "Add money", account: "personal", sign: -1, cash: 0, merchant: "Savings goal" },
};

const round = (n: number) => Math.round(n * 100) / 100;

/** Money available to the transfer: the account balance or the investment cash. */
export function availableFor(state: AppState, kind: TransferKind) {
  if (kind === "withdraw") return state.investmentCash;
  if (kind === "topup") return undefined;
  return state.accounts.find((a) => a.id === transferConfig[kind].account)?.balance ?? 0;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return initialState;
    case "sync":
      return { ...state, ...action.snapshot };
    case "toggleBalance":
      return { ...state, balanceHidden: !state.balanceHidden };
    case "selectPaymentMethod":
      return { ...state, paymentMethodId: action.id };
    case "transfer": {
      const config = transferConfig[action.kind];
      const goal = action.kind === "goal" ? state.goals.find((g) => g.id === action.goalId) : undefined;
      if (action.kind === "goal" && !goal) return state;
      const signed = config.sign * action.amount;
      const transaction: Transaction = {
        id: `t${Date.now()}`,
        merchant: goal?.name ?? (action.counterparty?.trim() || config.merchant),
        category: goal
          ? "Savings"
          : action.kind === "deposit" || action.kind === "withdraw"
            ? "Investing"
            : "Transfer",
        amount: signed,
        date: (action.now ?? new Date()).toISOString(),
        account: config.account,
        note: goal ? "Added to savings goal" : config.title,
      };
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === config.account ? { ...a, balance: round(a.balance + signed) } : a,
        ),
        investmentCash: round(state.investmentCash + config.cash * action.amount),
        transactions: [transaction, ...state.transactions],
        goals: goal
          ? state.goals.map((g) => (g.id === goal.id ? { ...g, saved: round(g.saved + action.amount) } : g))
          : state.goals,
      };
    }
    case "createGoal":
      return { ...state, goals: [...state.goals, action.goal] };
    case "deleteGoal": {
      // Closing a goal returns what was saved to the Personal account.
      const goal = state.goals.find((g) => g.id === action.id);
      if (!goal) return state;
      const goals = state.goals.filter((g) => g.id !== action.id);
      if (goal.saved <= 0) return { ...state, goals };
      return {
        ...state,
        goals,
        accounts: state.accounts.map((a) => (a.id === "personal" ? { ...a, balance: round(a.balance + goal.saved) } : a)),
        transactions: [
          {
            id: `t${Date.now()}`,
            merchant: goal.name,
            category: "Savings",
            amount: goal.saved,
            date: (action.now ?? new Date()).toISOString(),
            account: "personal",
            note: "Goal closed, savings returned",
          },
          ...state.transactions,
        ],
      };
    }
  }
}

/** Money movements and goal changes; every screen goes through these. */
export interface AppActions {
  transfer: (input: { kind: TransferKind; amount: number; counterparty?: string; goalId?: string }) => Promise<void>;
  /** Resolves to the new goal's id. */
  createGoal: (input: { name: string; template: GoalTemplateId; target: number }) => Promise<string>;
  closeGoal: (id: string) => Promise<void>;
  /** Demo mode only: back to the starting demo data. Real accounts have no reset. */
  resetData?: () => Promise<void>;
  /** Re-fetches from Supabase; a no-op in demo mode. */
  refresh: () => Promise<void>;
}

export type SyncStatus = { state: "idle" } | { state: "syncing" } | { state: "error"; message: string };

interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  actions: AppActions;
  ready: boolean;
  mode: "demo" | "supabase";
  sync: SyncStatus;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const SAVE_DELAY = 300;

/** Starting point for a Supabase user whose data hasn't loaded yet. */
const emptyRemoteState: AppState = { ...initialState, accounts: [], transactions: [], goals: [], investmentCash: 0 };

/**
 * Holds the in-app data.
 *
 * Demo mode: restores the signed-in user's saved copy (or the demo data),
 * saves every change on the device, and wipes it on sign-out.
 *
 * Supabase mode: the server owns balances, transactions and goals. The saved
 * copy is only an offline cache shown until the fresh snapshot arrives, and
 * every action runs a server function, then re-fetches.
 */
export function AppStateProvider({ children, initial = initialState }: { children: ReactNode; initial?: AppState }) {
  const { status, session } = useSession();
  const email = session?.email ?? null;
  const supabase = getSupabase();
  const mode = supabase ? "supabase" : "demo";
  const [state, dispatch] = useReducer(appReducer, initial);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncStatus>({ state: "idle" });
  const previousEmail = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setSync({ state: "syncing" });
    try {
      const snapshot = await fetchSnapshot(supabase, email ?? undefined);
      dispatch({ type: "sync", snapshot });
      setSync({ state: "idle" });
    } catch (error) {
      setSync({ state: "error", message: errorMessage(error, "Couldn't load your data.") });
    }
  }, [supabase, email]);

  // Restore on sign-in; clear on sign-out.
  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;

    if (email) {
      void loadState(email).then(async (saved) => {
        if (cancelled) return;
        if (!supabase) {
          dispatch(saved ? { type: "hydrate", state: saved } : { type: "reset" });
          setHydratedFor(email);
          return;
        }
        // Show the cached copy straight away (if any), then load the server's.
        dispatch({ type: "hydrate", state: saved ?? emptyRemoteState });
        if (saved) setHydratedFor(email);
        setSync({ state: "syncing" });
        try {
          const snapshot = await fetchSnapshot(supabase, email);
          if (cancelled) return;
          dispatch({ type: "sync", snapshot });
          setSync({ state: "idle" });
        } catch (error) {
          if (!cancelled) setSync({ state: "error", message: errorMessage(error, "Couldn't load your data.") });
        } finally {
          if (!cancelled) setHydratedFor(email);
        }
      });
    } else {
      dispatch({ type: "reset" });
      const previous = previousEmail.current;
      if (previous) void clearState(previous).then(() => !cancelled && setHydratedFor(null));
    }
    previousEmail.current = email;

    return () => {
      cancelled = true;
    };
  }, [status, email, supabase]);

  // Save changes (debounced) once the signed-in user's data is loaded.
  useEffect(() => {
    if (!email || hydratedFor !== email) return;
    const timer = setTimeout(() => void saveState(email, state), SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [state, email, hydratedFor]);

  const actions = useMemo<AppActions>(() => {
    if (!supabase) {
      return {
        transfer: async (input) => dispatch({ type: "transfer", ...input }),
        createGoal: async ({ name, template, target }) => {
          const id = `g${Date.now()}`;
          dispatch({
            type: "createGoal",
            goal: { id, name, template, target, saved: 0, createdAt: new Date().toISOString() },
          });
          return id;
        },
        closeGoal: async (id) => dispatch({ type: "deleteGoal", id }),
        resetData: async () => dispatch({ type: "reset" }),
        refresh: async () => {},
      };
    }
    // Server functions validate and apply the change; then pull the result.
    const run = async <T,>(operation: () => Promise<T>) => {
      const result = await operation();
      await refresh();
      return result;
    };
    return {
      transfer: (input) => run(() => remoteTransfer(supabase, input)),
      createGoal: (input) => run(() => remoteCreateGoal(supabase, input)),
      closeGoal: (id) => run(() => remoteCloseGoal(supabase, id)),
      refresh,
    };
  }, [supabase, refresh]);

  const ready = status === "signedOut" || (status === "signedIn" && hydratedFor === email);
  const value = useMemo(
    () => ({ state, dispatch, actions, ready, mode, sync }) satisfies AppStateContextValue,
    [state, actions, ready, mode, sync],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside <AppStateProvider>");
  return context;
}

export function totalBalance(state: AppState) {
  return state.accounts.reduce((sum, a) => sum + a.balance, 0);
}
