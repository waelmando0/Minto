import type { SupabaseClient } from "@supabase/supabase-js";

/*
 * The signed-in user's data, read with their own session. Row-level security
 * returns only their rows; the website never writes (transfers and goals are
 * changed in the app through server functions).
 */

export interface AccountSummary {
  kind: "investment" | "personal";
  name: string;
  balance: number;
  color: string;
  last4: string;
}

export interface ActivityItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  account: AccountSummary["kind"];
}

export interface GoalSummary {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface AccountOverview {
  displayName: string;
  accounts: AccountSummary[];
  investmentCash: number;
  total: number;
  activity: ActivityItem[];
  goals: GoalSummary[];
}

/** Postgres numerics arrive as strings; money is kept to cents. */
const money = (value: number | string) => Math.round(Number(value) * 100) / 100;

const ACCOUNT_ORDER = ["investment", "personal"] as const;

export async function fetchAccountOverview(supabase: SupabaseClient, email: string | undefined): Promise<AccountOverview> {
  const [profiles, accounts, transactions, goals] = await Promise.all([
    supabase.from("profiles").select("full_name, investment_cash").limit(1),
    supabase.from("accounts").select("kind, name, balance, color, last4"),
    supabase
      .from("transactions")
      .select("id, account_kind, merchant, category, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("goals").select("id, name, target, saved").order("created_at"),
  ]);
  const failed = [profiles, accounts, transactions, goals].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);

  const profile = profiles.data?.[0];
  const accountRows = (accounts.data ?? [])
    .map((a) => ({ ...a, balance: money(a.balance) }) as AccountSummary)
    .sort((a, b) => ACCOUNT_ORDER.indexOf(a.kind) - ACCOUNT_ORDER.indexOf(b.kind));

  return {
    displayName: profile?.full_name?.trim() || email?.split("@")[0] || "there",
    accounts: accountRows,
    investmentCash: money(profile?.investment_cash ?? 0),
    total: money(accountRows.reduce((sum, a) => sum + a.balance, 0)),
    activity: (transactions.data ?? []).map((t) => ({
      id: t.id,
      merchant: t.merchant,
      category: t.category,
      amount: money(t.amount),
      date: t.created_at,
      account: t.account_kind,
    })),
    goals: (goals.data ?? []).map((g) => ({ id: g.id, name: g.name, target: money(g.target), saved: money(g.saved) })),
  };
}
