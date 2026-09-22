import { appReducer, availableFor, initialState, totalBalance } from "@/state/app-state";

const personal = (state: typeof initialState) => state.accounts.find((a) => a.id === "personal")!.balance;

describe("appReducer", () => {
  it("starts with the website's total balance", () => {
    expect(totalBalance(initialState)).toBeCloseTo(36862.76, 2);
  });

  it("send debits Personal and records a transfer", () => {
    const next = appReducer(initialState, { type: "transfer", kind: "send", amount: 250, counterparty: "Maria" });
    expect(personal(next)).toBeCloseTo(personal(initialState) - 250, 2);
    expect(next.transactions[0]).toMatchObject({ merchant: "Maria", amount: -250, category: "Transfer" });
    expect(next.transactions).toHaveLength(initialState.transactions.length + 1);
  });

  it("deposit moves money from Personal into investment cash", () => {
    const next = appReducer(initialState, { type: "transfer", kind: "deposit", amount: 100 });
    expect(personal(next)).toBeCloseTo(personal(initialState) - 100, 2);
    expect(next.investmentCash).toBeCloseTo(initialState.investmentCash + 100, 2);
    expect(next.transactions[0].category).toBe("Investing");
  });

  it("withdraw is limited by investment cash", () => {
    expect(availableFor(initialState, "withdraw")).toBe(initialState.investmentCash);
    const next = appReducer(initialState, { type: "transfer", kind: "withdraw", amount: 23 });
    expect(next.investmentCash).toBeCloseTo(initialState.investmentCash - 23, 2);
    expect(personal(next)).toBeCloseTo(personal(initialState) + 23, 2);
  });

  it("toggles balance visibility and selects payment methods", () => {
    expect(appReducer(initialState, { type: "toggleBalance" }).balanceHidden).toBe(true);
    expect(appReducer(initialState, { type: "selectPaymentMethod", id: "p3" }).paymentMethodId).toBe("p3");
  });
});
