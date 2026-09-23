import { act, render, screen, waitFor } from "@testing-library/react-native";
import { useEffect } from "react";
import { Text } from "react-native";

/*
 * Supabase mode, end to end through the app's providers, against a fake
 * client with the same surface the app uses (auth, from().select(), rpc()).
 */

type Result = { data: unknown; error: { message: string } | null };

const db = {
  profiles: [{ id: "u1", full_name: "Alice Doe", investment_cash: "2623.00" }],
  accounts: [
    { kind: "personal", name: "Personal", balance: "11890.76", color: "#2F6DF6", last4: "2207" },
    { kind: "investment", name: "Investment", balance: "24972.00", color: "#F7A531", last4: "4821" },
  ],
  transactions: [
    { id: "t1", account_kind: "personal", merchant: "Starbucks", category: "Food & Drink", amount: "-8.50", note: null, created_at: "2026-09-22T10:00:00Z" },
  ],
  goals: [{ id: "g1", name: "Trip", template: "vacation", target: "1000.00", saved: "250.00", created_at: "2026-09-01T00:00:00Z" }],
};

let failReads = false;
let rpcResult: Result = { data: null, error: null };
const rpc = jest.fn(async (_name: string, _args?: Record<string, unknown>) => rpcResult);
const signInWithOtp = jest.fn(async () => ({ error: null as { message: string } | null }));
const verifyOtp = jest.fn();
const session = { access_token: "jwt", user: { email: "Alice@Example.com" } };
let currentSession: typeof session | null = session;

function query(table: keyof typeof db) {
  const builder = {
    select: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (resolve: (r: Result) => unknown) =>
      Promise.resolve(failReads ? { data: null, error: { message: "network down" } } : { data: db[table], error: null }).then(resolve),
  };
  return builder;
}

const mockClient = {
  from: jest.fn((table: keyof typeof db) => query(table)),
  rpc,
  auth: {
    getSession: jest.fn(async () => ({ data: { session: currentSession } })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signInWithOtp,
    verifyOtp,
    signOut: jest.fn(async () => ({ error: null })),
  },
};

jest.mock("@/lib/supabase", () => ({
  getSupabase: () => mockClient,
  isSupabaseConfigured: () => true,
}));

/* eslint-disable import/first */
import { isDemoAuth, requestCode, verifyCode } from "@/lib/auth";
import { errorMessage, toSnapshot } from "@/lib/remote";
import { AppStateProvider, totalBalance, useAppState } from "@/state/app-state";
import { SessionProvider } from "@/state/session";
/* eslint-enable import/first */

beforeEach(() => {
  failReads = false;
  rpcResult = { data: null, error: null };
  currentSession = session;
  jest.clearAllMocks();
});

describe("remote mapping", () => {
  it("converts rows into app data", () => {
    const snap = toSnapshot(db.profiles[0], db.accounts as never, db.transactions as never, db.goals as never);
    expect(snap.displayName).toBe("Alice Doe");
    expect(snap.investmentCash).toBe(2623);
    expect(snap.accounts.map((a) => a.id)).toEqual(["investment", "personal"]);
    expect(snap.accounts[1].balance).toBe(11890.76);
    expect(snap.transactions[0]).toMatchObject({ id: "t1", amount: -8.5, date: "2026-09-22T10:00:00Z", account: "personal" });
    expect(snap.goals[0]).toMatchObject({ id: "g1", target: 1000, saved: 250 });
  });

  it("falls back to the email name and reads Postgres error messages", () => {
    expect(toSnapshot({ id: "u", full_name: " ", investment_cash: 0 }, [], [], [], "sam@x.io").displayName).toBe("sam");
    expect(errorMessage({ message: "Not enough available cash" })).toBe("Not enough available cash");
    expect(errorMessage(null, "fallback")).toBe("fallback");
    expect(errorMessage(new TypeError("Failed to fetch"))).toMatch(/Couldn't reach Minto/);
    expect(errorMessage({ message: "Network request failed" })).toMatch(/Couldn't reach Minto/);
  });
});

describe("Supabase auth", () => {
  it("uses email OTP and hides the demo code", async () => {
    expect(isDemoAuth()).toBe(false);
    await requestCode(" alice@example.com ");
    expect(signInWithOtp).toHaveBeenCalledWith({ email: "alice@example.com", options: { shouldCreateUser: true } });

    verifyOtp.mockResolvedValueOnce({ data: { session }, error: null });
    await expect(verifyCode("alice@example.com", "123456")).resolves.toEqual({ token: "jwt", email: "alice@example.com" });
    expect(verifyOtp).toHaveBeenCalledWith({ email: "alice@example.com", token: "123456", type: "email" });

    verifyOtp.mockResolvedValueOnce({ data: { session: null }, error: { message: "Token has expired or is invalid" } });
    await expect(verifyCode("alice@example.com", "000000")).rejects.toThrow(/invalid or has expired/);
  });
});

const api = {} as { app: ReturnType<typeof useAppState> };

function Probe() {
  const app = useAppState();
  useEffect(() => {
    api.app = app;
  });
  if (!app.ready) return <Text>loading</Text>;
  return (
    <Text>
      {`${app.mode} ${app.state.displayName} ${totalBalance(app.state).toFixed(2)} ${app.sync.state}`}
    </Text>
  );
}

const renderApp = () =>
  render(
    <SessionProvider>
      <AppStateProvider>
        <Probe />
      </AppStateProvider>
    </SessionProvider>,
  );

describe("AppStateProvider in Supabase mode", () => {
  it("loads the signed-in user's data from the server", async () => {
    await renderApp();
    expect(await screen.findByText("supabase Alice Doe 36862.76 idle")).toBeTruthy();
    expect(api.app.state.goals[0].name).toBe("Trip");
  });

  it("loads a brand-new, empty account and offers no demo reset", async () => {
    const saved = { ...db };
    Object.assign(db, {
      profiles: [{ ...db.profiles[0], investment_cash: "0.00" }],
      accounts: db.accounts.map((a) => ({ ...a, balance: "0.00" })),
      transactions: [],
      goals: [],
    });
    try {
      await renderApp();
      expect(await screen.findByText("supabase Alice Doe 0.00 idle")).toBeTruthy();
      expect(api.app.state.transactions).toEqual([]);
      expect(api.app.state.goals).toEqual([]);
      expect(api.app.actions.resetData).toBeUndefined();
    } finally {
      Object.assign(db, saved);
    }
  });

  it("runs transfers through the transfer() function, then re-fetches", async () => {
    await renderApp();
    await screen.findByText(/idle/);
    const readsBefore = mockClient.from.mock.calls.length;

    await act(async () => {
      await api.app.actions.transfer({ kind: "goal", amount: 100, goalId: "g1" });
    });
    expect(rpc).toHaveBeenCalledWith("transfer", { p_kind: "goal", p_amount: 100, p_counterparty: null, p_goal_id: "g1" });
    expect(mockClient.from.mock.calls.length).toBeGreaterThan(readsBefore);
  });

  it("surfaces the server's validation message", async () => {
    await renderApp();
    await screen.findByText(/idle/);
    rpcResult = { data: null, error: { message: "Not enough available cash" } };
    await expect(api.app.actions.transfer({ kind: "send", amount: 99999, counterparty: "Bob" })).rejects.toThrow(
      "Not enough available cash",
    );
  });

  it("creates and closes goals through their functions", async () => {
    await renderApp();
    await screen.findByText(/idle/);
    rpcResult = { data: { id: "g-new" }, error: null };
    let id = "";
    await act(async () => {
      id = await api.app.actions.createGoal({ name: "Car", template: "car", target: 5000 });
    });
    expect(id).toBe("g-new");
    expect(rpc).toHaveBeenCalledWith("create_goal", { p_name: "Car", p_template: "car", p_target: 5000 });

    rpcResult = { data: null, error: null };
    await act(async () => {
      await api.app.actions.closeGoal("g1");
    });
    expect(rpc).toHaveBeenCalledWith("close_goal", { p_goal_id: "g1" });
  });

  it("reports a failed load and recovers on retry", async () => {
    failReads = true;
    await renderApp();
    expect(await screen.findByText(/ error$/)).toBeTruthy();
    expect(api.app.sync).toEqual({ state: "error", message: "network down" });

    failReads = false;
    await act(async () => {
      await api.app.actions.refresh();
    });
    await waitFor(() => expect(screen.getByText("supabase Alice Doe 36862.76 idle")).toBeTruthy());
  });

  it("shows the auth screens when there is no session", async () => {
    currentSession = null;
    await renderApp();
    await waitFor(() => expect(api.app?.ready).toBe(true));
    expect(mockClient.from).not.toHaveBeenCalled();
  });
});
