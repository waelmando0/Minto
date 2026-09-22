import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavMenuItem extends NavLink {
  description: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  /** Plain link when there is no dropdown. */
  href?: string;
  items?: NavMenuItem[];
}

export interface Highlight {
  id: string;
  title: string;
  stat: string;
  statLabel: string;
  description: string;
  icon: LucideIcon;
}

export type FeaturePreview = "transactions" | "portfolio" | "performance" | "payment-methods";

export interface FeatureCard {
  title: string;
  description: string;
  preview: FeaturePreview;
}

export interface ChecklistItem {
  label: string;
  icon: LucideIcon;
}

export interface InvestCard {
  id: string;
  label: string;
  value: string;
  /** Rendered under the value: a trend or a caption. */
  meta: { kind: "trend"; change: string; caption: string } | { kind: "caption"; text: string } | { kind: "accent"; text: string };
  title: string;
  description: string;
  cta: NavLink;
  featured?: boolean;
  /** Renders the value as a live amount input instead of a balance. */
  input?: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

/* ---------- In-app mock data ---------- */

export interface Transaction {
  merchant: string;
  category: string;
  amount: number;
  date: string;
  icon: LucideIcon;
  /** Tailwind classes for the merchant tile. */
  tone: string;
}

export interface Holding {
  name: string;
  value: number;
  totalReturn: number;
  icon: LucideIcon;
  tone: string;
}

export interface PaymentMethod {
  bank: string;
  account: string;
  mark: string;
  tone: string;
}

export interface QuickAction {
  label: string;
  icon: LucideIcon;
}

export interface WalletCard {
  name: string;
  balance: number;
  tone: string;
}

export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}
