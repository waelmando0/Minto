import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";

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

export interface AppState {
  accounts: Account[];
  investmentCash: number;
  transactions: Transaction[];
  balanceHidden: boolean;
  paymentMethodId: string;
}

export type AppAction =
  | { type: "toggleBalance" }
  | { type: "selectPaymentMethod"; id: string }
  | { type: "transfer"; kind: TransferKind; amount: number; counterparty?: string; now?: Date };

export const initialState: AppState = {
  accounts: initialAccounts,
  investmentCash: initialInvestmentCash,
  transactions: initialTransactions,
  balanceHidden: false,
  paymentMethodId: paymentMethods[0].id,
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
};

/** Money available to the transfer: the account balance or the investment cash. */
export function availableFor(state: AppState, kind: TransferKind) {
  if (kind === "withdraw") return state.investmentCash;
  if (kind === "topup") return undefined;
  return state.accounts.find((a) => a.id === transferConfig[kind].account)?.balance ?? 0;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "toggleBalance":
      return { ...state, balanceHidden: !state.balanceHidden };
    case "selectPaymentMethod":
      return { ...state, paymentMethodId: action.id };
    case "transfer": {
      const config = transferConfig[action.kind];
      const signed = config.sign * action.amount;
      const transaction: Transaction = {
        id: `t${Date.now()}`,
        merchant: action.counterparty?.trim() || config.merchant,
        category: action.kind === "deposit" || action.kind === "withdraw" ? "Investing" : "Transfer",
        amount: signed,
        date: (action.now ?? new Date()).toISOString(),
        account: config.account,
        note: config.title,
      };
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === config.account ? { ...a, balance: Math.round((a.balance + signed) * 100) / 100 } : a,
        ),
        investmentCash: Math.round((state.investmentCash + config.cash * action.amount) * 100) / 100,
        transactions: [transaction, ...state.transactions],
      };
    }
  }
}

const AppStateContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | null>(null);

export function AppStateProvider({ children, initial = initialState }: { children: ReactNode; initial?: AppState }) {
  const [state, dispatch] = useReducer(appReducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
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
