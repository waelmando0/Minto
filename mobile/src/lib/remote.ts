import type { SupabaseClient } from "@supabase/supabase-js";

import type { GoalTemplateId, Goal } from "@/data/goals";
import { accounts as accountStyles, type Account, type AccountId, type Category, type Transaction, type TransferKind } from "@/data/mock";

/*
 * Reads and writes the app's data in Supabase. Row types mirror
 * supabase/migrations; every write goes through a server function that
 * validates it, so the messages thrown here come straight from Postgres.
 */

interface ProfileRow {
  id: string;
  full_name: string | null;
  investment_cash: number | string;
}
interface AccountRow {
  kind: AccountId;
  name: string;
  balance: number | string;
  color: string;
  last4: string;
}
interface TransactionRow {
  id: string;
  account_kind: AccountId;
  merchant: string;
  category: Category;
  amount: number | string;
  note: string | null;
  created_at: string;
}
interface GoalRow {
  id: string;
  name: string;
  template: GoalTemplateId;
  target: number | string;
  saved: number | string;
  created_at: string;
}

export interface RemoteSnapshot {
  displayName: string | undefined;
  accounts: Account[];
  investmentCash: number;
  transactions: Transaction[];
  goals: Goal[];
}

/** Postgres numerics arrive as strings; money is kept to cents. */
const money = (value: number | string) => Math.round(Number(value) * 100) / 100;

const ACCOUNT_ORDER: AccountId[] = ["investment", "personal"];

export function toSnapshot(
  profile: ProfileRow | null,
  accounts: AccountRow[],
  transactions: TransactionRow[],
  goals: GoalRow[],
  email?: string,
): RemoteSnapshot {
  return {
    displayName: profile?.full_name?.trim() || (email ? email.split("@")[0] : undefined),
    investmentCash: money(profile?.investment_cash ?? 0),
    accounts: [...accounts]
      .sort((a, b) => ACCOUNT_ORDER.indexOf(a.kind) - ACCOUNT_ORDER.indexOf(b.kind))
      .map((a) => ({
        id: a.kind,
        name: a.name,
        balance: money(a.balance),
        color: a.color || accountStyles.find((s) => s.id === a.kind)?.color || "#2F6DF6",
        last4: a.last4,
      })),
    transactions: transactions.map((t) => ({
      id: t.id,
      merchant: t.merchant,
      category: t.category,
      amount: money(t.amount),
      date: t.created_at,
      account: t.account_kind,
      note: t.note ?? undefined,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      template: g.template,
      target: money(g.target),
      saved: money(g.saved),
      createdAt: g.created_at,
    })),
  };
}

const NETWORK_ERROR = /failed to fetch|network request failed|networkerror|load failed|fetch failed/i;

/** Turns a Supabase / PostgREST error into the message to show the user. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
    if (NETWORK_ERROR.test(error.message)) return "Couldn't reach Minto. Check your connection and try again.";
    return error.message;
  }
  return fallback;
}

async function unwrap<T>(promise: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(errorMessage(error));
  return data;
}

export async function fetchSnapshot(supabase: SupabaseClient, email?: string): Promise<RemoteSnapshot> {
  const [profiles, accounts, transactions, goals] = await Promise.all([
    unwrap(supabase.from("profiles").select("id, full_name, investment_cash").limit(1)),
    unwrap(supabase.from("accounts").select("kind, name, balance, color, last4")),
    unwrap(
      supabase
        .from("transactions")
        .select("id, account_kind, merchant, category, amount, note, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ),
    unwrap(supabase.from("goals").select("id, name, template, target, saved, created_at").order("created_at")),
  ]);
  return toSnapshot(
    (profiles as ProfileRow[])[0] ?? null,
    accounts as AccountRow[],
    transactions as TransactionRow[],
    goals as GoalRow[],
    email,
  );
}

export async function remoteTransfer(
  supabase: SupabaseClient,
  input: { kind: TransferKind; amount: number; counterparty?: string; goalId?: string },
) {
  await unwrap(
    supabase.rpc("transfer", {
      p_kind: input.kind,
      p_amount: input.amount,
      p_counterparty: input.counterparty ?? null,
      p_goal_id: input.goalId ?? null,
    }),
  );
}

export async function remoteCreateGoal(
  supabase: SupabaseClient,
  input: { name: string; template: GoalTemplateId; target: number },
): Promise<string> {
  const goal = await unwrap(
    supabase.rpc("create_goal", { p_name: input.name, p_template: input.template, p_target: input.target }),
  );
  return (goal as GoalRow).id;
}

export async function remoteCloseGoal(supabase: SupabaseClient, goalId: string) {
  await unwrap(supabase.rpc("close_goal", { p_goal_id: goalId }));
}

export async function remoteReset(supabase: SupabaseClient) {
  await unwrap(supabase.rpc("reset_demo_data"));
}
