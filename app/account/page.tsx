import type { Metadata } from "next";
import { connection } from "next/server";
import { LogOut, Smartphone, Target } from "lucide-react";

import { signOut } from "@/app/actions/login";
import { Container } from "@/components/container";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { LoginDialog } from "@/components/login-dialog";
import { MintoMark } from "@/components/logo";
import { StoreButtons, pillVariants } from "@/components/store-buttons";
import { fetchAccountOverview, type AccountOverview } from "@/lib/account";
import { formatCurrency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  // Always rendered per request: the page depends on who is signed in.
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <SignedOut reason="unavailable" />;

  // getUser() asks Supabase Auth to confirm the session instead of trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const { link } = await searchParams;
    return <SignedOut reason={link === "expired" ? "expired" : "signed-out"} />;
  }

  const overview = await fetchAccountOverview(supabase, user.email);
  return <Overview overview={overview} email={user.email} />;
}

const signedOutCopy = {
  "signed-out": {
    title: "Log in to see your account",
    body: "Your balances, recent activity and goals, the same as in the Minto app.",
  },
  expired: {
    title: "That sign-in link has expired",
    body: "Links work once, in the browser that asked for them. Log in again and enter the code from the email instead.",
  },
  unavailable: {
    title: "Sign-in is unavailable",
    body: "Web sign-in isn't set up on this site yet. You can still use your account in the Minto app.",
  },
} as const;

function SignedOut({ reason }: { reason: keyof typeof signedOutCopy }) {
  const copy = signedOutCopy[reason];
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center gap-5 pt-24 pb-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#111] text-white">
        <MintoMark className="size-6" />
      </span>
      <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{copy.title}</h1>
      <p className="max-w-md text-muted-foreground">{copy.body}</p>
      {reason === "unavailable" ? (
        <StoreButtons className="mt-2" size="lg" />
      ) : (
        <LoginDialog>
          <button type="button" className={cn(pillVariants({ tone: "dark", size: "lg" }), "mt-2 normal-case tracking-normal")}>
            Log in
          </button>
        </LoginDialog>
      )}
    </Container>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function Overview({ overview, email }: { overview: AccountOverview; email: string | undefined }) {
  const { displayName, accounts, investmentCash, total, activity, goals } = overview;

  return (
    <Container className="pt-28 pb-20 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{email}</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Hi, {displayName}</h1>
        </div>
        <form action={signOut}>
          <button type="submit" className={cn(pillVariants({ tone: "outline", size: "md" }), "normal-case tracking-normal")}>
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </button>
        </form>
      </div>

      <section aria-labelledby="balance-title" className="mt-8 rounded-3xl bg-graphite p-6 text-white sm:p-8">
        <h2 id="balance-title" className="text-sm text-white/60">
          Total balance
        </h2>
        <p className="mt-2 text-4xl font-medium tracking-[-0.04em] tabular-nums sm:text-5xl">{formatCurrency(total)}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => (
            <li key={account.kind} className="flex items-center gap-3 rounded-2xl bg-graphite-raised p-4">
              <span aria-hidden className="h-9 w-1.5 rounded-full" style={{ backgroundColor: account.color }} />
              <span className="flex-1">
                <span className="block text-sm font-medium">{account.name}</span>
                <span className="block text-xs text-white/55">•••• {account.last4}</span>
              </span>
              <span className="font-medium tabular-nums">{formatCurrency(account.balance)}</span>
            </li>
          ))}
        </ul>
        {investmentCash > 0 ? (
          <p className="mt-4 text-xs text-white/55">
            {formatCurrency(investmentCash)} uninvested cash in your brokerage account.
          </p>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="activity-title" className="rounded-3xl bg-muted p-6 sm:p-7">
          <h2 id="activity-title" className="text-lg font-medium tracking-[-0.02em]">
            Recent activity
          </h2>
          {activity.length ? (
            <ul className="mt-4 divide-y divide-black/5">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.merchant}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.category} · <time dateTime={item.date}>{dateFormat.format(new Date(item.date))}</time>
                    </span>
                  </span>
                  <span
                    className={cn("shrink-0 text-sm font-medium tabular-nums", item.amount > 0 && "text-emerald-700")}
                  >
                    {formatCurrency(item.amount, { signed: true })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
          )}
        </section>

        <section aria-labelledby="goals-title" className="rounded-3xl bg-mint p-6 text-mint-foreground sm:p-7">
          <h2 id="goals-title" className="text-lg font-medium tracking-[-0.02em]">
            Savings goals
          </h2>
          {goals.length ? (
            <ul className="mt-4 grid gap-4">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
                return (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{goal.name}</span>
                      <span className="tabular-nums">
                        {formatCurrency(goal.saved)} <span className="opacity-60">of {formatCurrency(goal.target)}</span>
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${goal.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                      className="mt-2 h-2 overflow-hidden rounded-full bg-white/70"
                    >
                      <div className="h-full rounded-full bg-mint-foreground" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Target className="size-4" aria-hidden />
              No goals yet. Start one in the app.
            </p>
          )}
        </section>
      </div>

      <aside className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center sm:p-7">
        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <Smartphone className="size-5 shrink-0 text-foreground" aria-hidden />
          Send money, invest and manage goals in the Minto app. This page is view-only.
        </p>
        <StoreButtons className="justify-start" />
      </aside>

      <div className="mt-10 border-t pt-6">
        <DeleteAccountDialog />
      </div>
    </Container>
  );
}
