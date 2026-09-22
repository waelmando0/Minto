import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from "react";

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
import { initialGoals, type Goal } from "@/data/goals";
import { clearState, loadState, saveState } from "@/lib/persist";
import { useSession } from "@/state/session";

export interface AppState {
  accounts: Account[];
  investmentCash: number;
  transactions: Transaction[];
  balanceHidden: boolean;
  paymentMethodId: string;
  goals: Goal[];
}

export type AppAction =
  | { type: "hydrate"; state: AppState }
  | { type: "reset" }
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

const AppStateContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction>; ready: boolean } | null>(null);

const SAVE_DELAY = 300;

/**
 * Holds the in-app data. When someone signs in it restores their saved copy
 * (or starts from the demo data), saves every change, and wipes both memory
 * and storage on sign-out.
 */
export function AppStateProvider({ children, initial = initialState }: { children: ReactNode; initial?: AppState }) {
  const { status, session } = useSession();
  const email = session?.email ?? null;
  const [state, dispatch] = useReducer(appReducer, initial);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const previousEmail = useRef<string | null>(null);

  // Restore on sign-in; clear on sign-out.
  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;

    if (email) {
      void loadState(email).then((saved) => {
        if (cancelled) return;
        dispatch(saved ? { type: "hydrate", state: saved } : { type: "reset" });
        setHydratedFor(email);
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
  }, [status, email]);

  // Save changes (debounced) once the signed-in user's data is loaded.
  useEffect(() => {
    if (!email || hydratedFor !== email) return;
    const timer = setTimeout(() => void saveState(email, state), SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [state, email, hydratedFor]);

  const ready = status === "signedOut" || (status === "signedIn" && hydratedFor === email);
  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
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
