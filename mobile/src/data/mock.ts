import {
  ArrowDownToLine,
  Banknote,
  CarFront,
  CirclePlus,
  Clapperboard,
  Coffee,
  Cpu,
  Globe,
  History,
  Leaf,
  PiggyBank,
  QrCode,
  Receipt,
  Send,
  ShoppingBag,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react-native";

/*
 * Mock data mirroring the Minto website mockups. Replace with API calls when a
 * backend exists; screens only read it through the app store.
 */

export const user = { firstName: "Rafael", name: "Rafael Leao", email: "rafael@minto.app" };

export type AccountId = "investment" | "personal";

export interface Account {
  id: AccountId;
  name: string;
  balance: number;
  color: string;
  last4: string;
}

export const accounts: Account[] = [
  { id: "investment", name: "Investment", balance: 24972, color: "#F7A531", last4: "4821" },
  { id: "personal", name: "Personal", balance: 11890.76, color: "#2F6DF6", last4: "2207" },
];

/** Cash sitting in the brokerage account, ready to invest. */
export const investmentCash = 2623;

export type Category =
  | "Food & Drink"
  | "Entertainment"
  | "Shopping"
  | "Salary"
  | "Transport"
  | "Groceries"
  | "Bills"
  | "Transfer"
  | "Investing";

export const categoryStyle: Record<Category, { icon: LucideIcon; bg: string; fg: string }> = {
  "Food & Drink": { icon: Coffee, bg: "#F3EAD9", fg: "#7A5A2A" },
  Entertainment: { icon: Clapperboard, bg: "#1B1B1B", fg: "#FF4B55" },
  Shopping: { icon: ShoppingBag, bg: "#FBEEDE", fg: "#C07A2C" },
  Salary: { icon: Banknote, bg: "#DFF3E3", fg: "#2F8A4A" },
  Transport: { icon: CarFront, bg: "#ECECEF", fg: "#1C1C1E" },
  Groceries: { icon: ShoppingBasket, bg: "#E4F3E0", fg: "#3F7F2E" },
  Bills: { icon: Receipt, bg: "#E3EBFF", fg: "#3D63E0" },
  Transfer: { icon: Send, bg: "#E3EBFF", fg: "#2F6DF6" },
  Investing: { icon: PiggyBank, bg: "#ECE6FE", fg: "#7A4CF5" },
};

export interface Transaction {
  id: string;
  merchant: string;
  category: Category;
  amount: number;
  /** ISO timestamp. */
  date: string;
  account: AccountId;
  note?: string;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const transactions: Transaction[] = [
  { id: "t1", merchant: "Starbucks", category: "Food & Drink", amount: -8.5, date: hoursAgo(2), account: "personal" },
  { id: "t2", merchant: "Netflix", category: "Entertainment", amount: -15.99, date: hoursAgo(26), account: "personal" },
  { id: "t3", merchant: "Apple Store", category: "Shopping", amount: -129, date: hoursAgo(52), account: "personal" },
  { id: "t4", merchant: "Payroll", category: "Salary", amount: 3850, date: hoursAgo(98), account: "personal", note: "Monthly salary" },
  { id: "t5", merchant: "Uber", category: "Transport", amount: -23.4, date: hoursAgo(120), account: "personal" },
  { id: "t6", merchant: "Whole Foods", category: "Groceries", amount: -86.12, date: hoursAgo(140), account: "personal" },
  { id: "t7", merchant: "Con Edison", category: "Bills", amount: -94.3, date: hoursAgo(170), account: "personal" },
  { id: "t8", merchant: "Global Equity ETF", category: "Investing", amount: -500, date: hoursAgo(200), account: "investment", note: "Recurring buy" },
  { id: "t9", merchant: "Blue Bottle", category: "Food & Drink", amount: -6.25, date: hoursAgo(230), account: "personal" },
  { id: "t10", merchant: "Spotify", category: "Entertainment", amount: -11.99, date: hoursAgo(260), account: "personal" },
  { id: "t11", merchant: "Lyft", category: "Transport", amount: -17.8, date: hoursAgo(300), account: "personal" },
  { id: "t12", merchant: "Trader Joe's", category: "Groceries", amount: -54.66, date: hoursAgo(330), account: "personal" },
];

export interface Holding {
  id: string;
  name: string;
  value: number;
  totalReturn: number;
  icon: LucideIcon;
  bg: string;
  fg: string;
}

export const holdings: Holding[] = [
  { id: "h1", name: "Emergency Fund", value: 1238.97, totalReturn: 99, icon: PiggyBank, bg: "#ECE6FE", fg: "#7A4CF5" },
  { id: "h2", name: "Technology Fund", value: 6548, totalReturn: 468.35, icon: Cpu, bg: "#FFEEDC", fg: "#E5822A" },
  { id: "h3", name: "Global Equity ETF", value: 4882.15, totalReturn: 1037.41, icon: Globe, bg: "#E3EBFF", fg: "#3D63E0" },
  { id: "h4", name: "Green Energy Fund", value: 2410.6, totalReturn: -38.2, icon: Leaf, bg: "#E0F4E5", fg: "#2F8A4A" },
];

export interface PaymentMethod {
  id: string;
  bank: string;
  account: string;
  mark: string;
  color: string;
}

export const paymentMethods: PaymentMethod[] = [
  { id: "p1", bank: "Chase Bank", account: "Checking •••• 2021", mark: "C", color: "#1A5BB8" },
  { id: "p2", bank: "Bank of America", account: "Checking •••• 4458", mark: "B", color: "#D4202C" },
  { id: "p3", bank: "Wells Fargo", account: "Savings •••• 1274", mark: "W", color: "#C8102E" },
  { id: "p4", bank: "Citibank", account: "Checking •••• 8820", mark: "c", color: "#0F64C8" },
];

export type Range = "1D" | "1W" | "1M" | "3M" | "1Y";

/** Per-range chart seed and headline change, so switching ranges tells a different story. */
export const ranges: Record<Range, { seed: number; change: number; label: string }> = {
  "1D": { seed: 3, change: 0.8, label: "Compared to yesterday" },
  "1W": { seed: 11, change: -1.4, label: "Compared to last week" },
  "1M": { seed: 7, change: 12.5, label: "Compared to last month" },
  "3M": { seed: 21, change: 18.2, label: "Compared to 3 months ago" },
  "1Y": { seed: 42, change: 31.6, label: "Compared to last year" },
};

export type TransferKind = "send" | "topup" | "deposit" | "withdraw";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  /** Opens the transfer sheet with this kind, or routes to a tab. */
  action: { transfer: TransferKind } | { href: "/activity" | "/wallet" };
}

export const quickActions: QuickAction[] = [
  { label: "Send", icon: Send, action: { transfer: "send" } },
  { label: "Receive", icon: ArrowDownToLine, action: { href: "/wallet" } },
  { label: "QR", icon: QrCode, action: { href: "/wallet" } },
  { label: "Top Up", icon: CirclePlus, action: { transfer: "topup" } },
  { label: "History", icon: History, action: { href: "/activity" } },
];

export const transferLimits = { min: 10, max: 50_000 };
