import AsyncStorage from "@react-native-async-storage/async-storage";

import { goalProgress, goalTemplates, validateGoal } from "@/data/goals";
import { loadState, parseSaved } from "@/lib/persist";
import { appReducer, initialState } from "@/state/app-state";

const personal = (s: typeof initialState) => s.accounts.find((a) => a.id === "personal")!.balance;

describe("goal templates", () => {
  it("offers 12 templates with unique ids", () => {
    expect(goalTemplates).toHaveLength(12);
    expect(new Set(goalTemplates.map((t) => t.id)).size).toBe(12);
  });
});

describe("validateGoal", () => {
  it("requires a name and a target within limits", () => {
    expect(validateGoal(" ", "100")).toMatch(/name/);
    expect(validateGoal("Trip", "")).toMatch(/target amount/);
    expect(validateGoal("Trip", "5")).toMatch(/at least/);
    expect(validateGoal("Trip", "2000000")).toMatch(/at most/);
    expect(validateGoal("Trip", "1500")).toBeUndefined();
  });
});

describe("goals in the reducer", () => {
  const goal = { id: "gx", name: "Trip", template: "vacation" as const, target: 1000, saved: 0, createdAt: "2026-01-01" };

  it("creates a goal and funds it from Personal", () => {
    const created = appReducer(initialState, { type: "createGoal", goal });
    const funded = appReducer(created, { type: "transfer", kind: "goal", amount: 250, goalId: "gx" });

    expect(funded.goals.find((g) => g.id === "gx")!.saved).toBe(250);
    expect(personal(funded)).toBeCloseTo(personal(initialState) - 250, 2);
    expect(funded.transactions[0]).toMatchObject({ merchant: "Trip", category: "Savings", amount: -250 });
    expect(goalProgress(funded.goals.find((g) => g.id === "gx")!)).toBe(0.25);
  });

  it("ignores a goal transfer for an unknown goal", () => {
    expect(appReducer(initialState, { type: "transfer", kind: "goal", amount: 50, goalId: "nope" })).toBe(initialState);
  });

  it("closing a goal returns its savings to Personal", () => {
    const withGoal = appReducer(initialState, { type: "createGoal", goal: { ...goal, saved: 400 } });
    const closed = appReducer(withGoal, { type: "deleteGoal", id: "gx" });
    expect(closed.goals.find((g) => g.id === "gx")).toBeUndefined();
    expect(personal(closed)).toBeCloseTo(personal(initialState) + 400, 2);
    expect(closed.transactions[0]).toMatchObject({ amount: 400, category: "Savings" });
  });
});

describe("save migration", () => {
  const { goals: _goals, ...v1State } = initialState;

  it("upgrades a version 1 save by adding the starter goals", () => {
    const migrated = parseSaved(JSON.stringify({ version: 1, state: v1State }));
    expect(migrated?.goals).toEqual(initialState.goals);
  });

  it("reads a version 1 save from the legacy storage key", async () => {
    await AsyncStorage.setItem("minto.state.v1:rafael@minto.app", JSON.stringify({ version: 1, state: v1State }));
    const loaded = await loadState("Rafael@minto.app");
    expect(loaded?.goals).toHaveLength(initialState.goals.length);
  });

  it("rejects saves from a newer, unknown version", () => {
    expect(parseSaved(JSON.stringify({ version: 99, state: initialState }))).toBeNull();
  });
});
