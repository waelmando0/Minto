import type { Category, Transaction } from "@/data/mock";

export type Period = "7d" | "30d" | "all";

export const periods: { id: Period; label: string; days?: number }[] = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "all", label: "All time" },
];

/** Moves between your own accounts are not spending. */
const NOT_SPENDING: Category[] = ["Savings", "Investing"];

/** Distinct, legible chart colours per category. */
export const categoryColor: Record<Category, string> = {
  "Food & Drink": "#F7A531",
  Entertainment: "#E5484D",
  Shopping: "#D14B8F",
  Salary: "#2F8A4A",
  Transport: "#3D63E0",
  Groceries: "#4FA35F",
  Bills: "#7A4CF5",
  Transfer: "#2F6DF6",
  Investing: "#8A8A8F",
  Savings: "#1D2B21",
};

export interface CategorySpend {
  category: Category;
  total: number;
  /** 0–1 share of all spending in the period. */
  share: number;
  count: number;
}

export function inPeriod(transaction: Transaction, period: Period, now = new Date()) {
  const days = periods.find((p) => p.id === period)?.days;
  if (!days) return true;
  return now.getTime() - new Date(transaction.date).getTime() <= days * 86_400_000;
}

export function isSpending(transaction: Transaction) {
  return transaction.amount < 0 && !NOT_SPENDING.includes(transaction.category);
}

/** Spending per category for the period, largest first. Totals are positive numbers. */
export function spendingByCategory(transactions: Transaction[], period: Period, now = new Date()): CategorySpend[] {
  const totals = new Map<Category, { total: number; count: number }>();
  for (const t of transactions) {
    if (!isSpending(t) || !inPeriod(t, period, now)) continue;
    const entry = totals.get(t.category) ?? { total: 0, count: 0 };
    entry.total += -t.amount;
    entry.count += 1;
    totals.set(t.category, entry);
  }
  const sum = Array.from(totals.values()).reduce((s, e) => s + e.total, 0);
  return Array.from(totals, ([category, { total, count }]) => ({
    category,
    total: Math.round(total * 100) / 100,
    share: sum > 0 ? total / sum : 0,
    count,
  })).sort((a, b) => b.total - a.total);
}

/** Money in (income, excluding moves between your own accounts) for the period. */
export function incomeFor(transactions: Transaction[], period: Period, now = new Date()) {
  const total = transactions
    .filter((t) => t.amount > 0 && !NOT_SPENDING.includes(t.category) && inPeriod(t, period, now))
    .reduce((s, t) => s + t.amount, 0);
  return Math.round(total * 100) / 100;
}
