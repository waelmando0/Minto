import { applyKey, formatAmountInput, formatCurrency, formatDay, maskCurrency, validateAmount } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats plain and signed amounts", () => {
    expect(formatCurrency(1238.97)).toBe("$1,238.97");
    expect(formatCurrency(-8.5)).toBe("-$8.50");
    expect(formatCurrency(3850, { signed: true })).toBe("+$3,850.00");
    expect(formatCurrency(-15.99, { signed: true })).toBe("-$15.99");
  });

  it("masks digits but keeps the shape", () => {
    expect(maskCurrency("$36,862.76")).toBe("$••,•••.••");
  });
});

describe("formatDay", () => {
  const now = new Date(2026, 8, 22, 12);
  it("labels today, yesterday and older days", () => {
    expect(formatDay(new Date(2026, 8, 22, 8), now)).toBe("Today");
    expect(formatDay(new Date(2026, 8, 21, 23), now)).toBe("Yesterday");
    expect(formatDay(new Date(2026, 8, 12, 9), now)).toBe("Sep 12");
  });
});

describe("applyKey", () => {
  it("builds an amount from keypad presses", () => {
    const typed = ["2", "5", "0", ".", "5"].reduce(applyKey, "");
    expect(typed).toBe("250.5");
  });

  it("allows one decimal point and at most two decimals", () => {
    expect(applyKey("", ".")).toBe("0.");
    expect(applyKey("1.", ".")).toBe("1.");
    expect(applyKey("1.25", "9")).toBe("1.25");
  });

  it("replaces a lone zero and deletes with back", () => {
    expect(applyKey("0", "7")).toBe("7");
    expect(applyKey("250", "back")).toBe("25");
  });
});

describe("validateAmount", () => {
  const limits = { min: 10, max: 50_000 };
  it("enforces empty, min, max and available cash", () => {
    expect(validateAmount("", limits)).toBe("Enter an amount");
    expect(validateAmount("5", limits)).toBe("Minimum is $10.00");
    expect(validateAmount("60000", limits)).toBe("Maximum is $50,000.00 per transaction");
    expect(validateAmount("300", { ...limits, available: 250 })).toBe("Not enough available cash");
    expect(validateAmount("250", { ...limits, available: 250 })).toBeUndefined();
  });
});

describe("formatAmountInput", () => {
  it("groups thousands and keeps typed decimals", () => {
    expect(formatAmountInput("")).toBe("0");
    expect(formatAmountInput("250")).toBe("250");
    expect(formatAmountInput("99999")).toBe("99,999");
    expect(formatAmountInput("12500.")).toBe("12,500.");
    expect(formatAmountInput("1234567.5")).toBe("1,234,567.5");
  });
});
