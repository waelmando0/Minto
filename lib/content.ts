import {
  ArrowDownToLine,
  Banknote,
  BookOpen,
  CarFront,
  Briefcase,
  ChartCandlestick,
  CircleDollarSign,
  CirclePlus,
  Clapperboard,
  Coffee,
  Cpu,
  CreditCard,
  Flag,
  Globe,
  History,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  LifeBuoy,
  Lock,
  Newspaper,
  PiggyBank,
  Presentation,
  QrCode,
  ReceiptText,
  Send,
  ShieldCheck,
  ShoppingBag,
  SquareCheckBig,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import type {
  ChecklistItem,
  Faq,
  FeatureCard,
  FooterColumn,
  Highlight,
  Holding,
  InvestCard,
  NavGroup,
  PaymentMethod,
  QuickAction,
  Transaction,
  WalletCard,
} from "@/types";

/** Every string, number and image the Minto page renders lives here. */

export const mintoMeta = {
  name: "Minto",
  title: "Minto: Make your money work smarter for you",
  description:
    "Track your finances, grow investments, and control your money with one easy-to-use app designed for effortless financial management.",
  keywords: ["personal finance app", "budgeting", "investing", "money management", "Minto"],
  appStoreUrl: "https://apps.apple.com/",
  playStoreUrl: "https://play.google.com/store/apps",
  /** Public contact for support, privacy and data requests. */
  contactEmail: "wamoelti@gmail.com",
} as const;

export const navGroups: NavGroup[] = [
  {
    label: "Product",
    items: [
      {
        label: "Overview",
        href: "#overview",
        description: "Your whole financial life at a glance.",
        icon: LayoutDashboard,
      },
      {
        label: "Spending",
        href: "#features",
        description: "Every transaction, categorised automatically.",
        icon: ReceiptText,
      },
      {
        label: "Investments",
        href: "#invest",
        description: "Build, fund and monitor your portfolio.",
        icon: TrendingUp,
      },
      {
        label: "Insights",
        href: "#insights",
        description: "See how your money changes over time.",
        icon: ChartCandlestick,
      },
    ],
  },
  {
    label: "Use Cases",
    items: [
      {
        label: "Personal finance",
        href: "#about",
        description: "Budget, save and spend with intention.",
        icon: UserRound,
      },
      {
        label: "Families",
        href: "#about",
        description: "Shared goals and household spending.",
        icon: Users,
      },
      {
        label: "Freelancers",
        href: "#about",
        description: "Irregular income, handled calmly.",
        icon: Briefcase,
      },
      {
        label: "First-time investors",
        href: "#invest",
        description: "Start from $10 and learn as you grow.",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Help Center",
        href: "#faq",
        description: "Answers to the most common questions.",
        icon: LifeBuoy,
      },
      {
        label: "Guides",
        href: "#faq",
        description: "Practical playbooks for your money.",
        icon: BookOpen,
      },
      {
        label: "Blog",
        href: "#faq",
        description: "Product news and market insights.",
        icon: Newspaper,
      },
      {
        label: "Security",
        href: "#faq",
        description: "How we keep your data protected.",
        icon: ShieldCheck,
      },
    ],
  },
  { label: "Enterprise", href: "#contact" },
];

export const hero = {
  title: "Make your money work smarter for you.",
  description: mintoMeta.description,
};

export const about = {
  title: "We believe managing money should feel simple.",
  cta: { label: "About Minto", href: "#overview" },
};

export const highlights: Highlight[] = [
  {
    id: "everyday",
    title: "Built for everyday money",
    stat: "24/7",
    statLabel: "Always-on access",
    description:
      "From managing your spending to making smart investments, Minto unites all aspects of your financial life into one seamless and straightforward experience.",
    icon: CreditCard,
  },
  {
    id: "clarity",
    title: "Invest with clarity",
    stat: "50K+",
    statLabel: "Active investors",
    description:
      "Clear charts, plain-language insights and transparent fees help more than 50,000 investors understand exactly what they own and why.",
    icon: Presentation,
  },
  {
    id: "goals",
    title: "Your money, your goals",
    stat: "12+",
    statLabel: "Goal templates",
    description:
      "Pick from over a dozen goal templates, from an emergency fund to your first home, and Minto tracks your progress automatically.",
    icon: Flag,
  },
  {
    id: "design",
    title: "Designed around you",
    stat: "4.9/5",
    statLabel: "Average rating",
    description:
      "Rated 4.9 out of 5 for an interface that feels calm, fast and intuitive, whether you check in every day or once a month.",
    icon: LayoutGrid,
  },
  {
    id: "security",
    title: "Security comes first",
    stat: "256-bit",
    statLabel: "Encryption",
    description:
      "Bank-grade 256-bit encryption, biometric sign-in and real-time alerts keep your accounts and personal data protected around the clock.",
    icon: Lock,
  },
];

export const featureCards: FeatureCard[] = [
  {
    title: "See exactly where your money goes every month.",
    description: "Track your spending and stay on top of every transaction with ease.",
    preview: "transactions",
  },
  {
    title: "Build and monitor your investments.",
    description: "Keep your portfolio organized and follow how your investments perform.",
    preview: "portfolio",
  },
  {
    title: "Make sense of your financial performance.",
    description: "Track market trends and watch your investments grow.",
    preview: "performance",
  },
  {
    title: "Manage your money with confidence.",
    description: "Keep your payment methods organized and ready for daily use.",
    preview: "payment-methods",
  },
];

export const overview = {
  title: "Everything you need to stay on top of your money.",
  intro: {
    title: "Your finances, all in one place.",
    body: "Minto helps you see your money clearly, from daily expenses to investments, so you can decide with confidence.",
  },
  checklist: {
    title: "Stay on top of your finances.",
    items: [
      { label: "Track your spending", icon: SquareCheckBig },
      { label: "Manage your investments", icon: TrendingUp },
      { label: "Reach your goals", icon: Target },
      { label: "Stay in control", icon: ShieldCheck },
    ] satisfies ChecklistItem[],
  },
};

const exploreInvesting = { label: "Explore investing", href: "#insights" };

export const invest = {
  title: "Make every investment move with confidence.",
  cards: [
    {
      id: "assets",
      label: "Investment Assets",
      value: "$24,972.00",
      meta: { kind: "trend", change: "12.5%", caption: "Compared to last month" },
      title: "Know what you own.",
      description: "Track your investments and see how your portfolio is growing over time.",
      cta: exploreInvesting,
      featured: true,
    },
    {
      id: "amount",
      label: "Enter Amount",
      value: "$250.00",
      input: true,
      meta: { kind: "caption", text: "Min. $10 · Max. $50,000 per transaction" },
      title: "Invest at your pace.",
      description: "Choose how much you want to invest and put your money to work.",
      cta: exploreInvesting,
    },
    {
      id: "cash",
      label: "Available Cash",
      value: "$4,926.00",
      meta: { kind: "accent", text: "Ready to invest" },
      title: "Stay ready to invest.",
      description: "Keep your available cash visible and be ready for your next move.",
      cta: exploreInvesting,
    },
  ] satisfies InvestCard[],
};

export const insights = {
  title: "Dive deep into your investments for a complete and insightful view.",
  aside: "See where your money goes and how it changes over time.",
};

export const faq = {
  title: "Everything you need to know about Minto.",
  defaultOpen: 1,
  items: [
    {
      question: "How does Minto simplify everyday money management?",
      answer:
        "Minto brings your accounts, cards and spending into one dashboard. Transactions are categorised automatically, so you can see where your money goes without spreadsheets or manual tracking.",
    },
    {
      question: "How can Minto help me make smarter investments?",
      answer:
        "Minto gives you a clear view of your portfolio, investment performance, and available cash, helping you understand your money and make more informed investment decisions.",
    },
    {
      question: "How does Minto protect my financial information?",
      answer:
        "Your data is protected with 256-bit encryption in transit and at rest, biometric sign-in and optional two-factor authentication. We never sell your personal information.",
    },
    {
      question: "Can I manage spending and investments in one place?",
      answer:
        "Yes. Minto combines everyday spending, savings goals and your investment portfolio in a single app, so every decision is made with the full picture in view.",
    },
    {
      question: "What can I do with my investments in Minto?",
      answer:
        "Build a diversified portfolio, set up recurring investments from $10, track performance over any time range and move available cash in or out whenever you need.",
    },
    {
      question: "How can I get started with Minto?",
      answer:
        "Download Minto from the App Store or Google Play, create your account in a few minutes and connect your bank. You can start tracking and investing the same day.",
    },
  ] satisfies Faq[],
};

export const footer = {
  description:
    "Discover a simpler way to manage your money effectively, invest with greater confidence, and steadily build toward your future goals and dreams with ease.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Overview", href: "#overview" },
        { label: "Features", href: "#features" },
        { label: "Investments", href: "#invest" },
        { label: "Security", href: "#faq" },
        { label: "Pricing", href: "#invest" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Minto", href: "#about" },
        { label: "Our Mission", href: "#about" },
        { label: "Careers", href: "#contact" },
        { label: "Contact", href: "/support" },
        { label: "Press", href: "#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/support" },
        { label: "Guides", href: "#faq" },
        { label: "FAQs", href: "#faq" },
        { label: "Insights", href: "#insights" },
        { label: "Blog", href: "#faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "#contact" },
        { label: "Cookie Policy", href: "#contact" },
        { label: "Accessibility", href: "#faq" },
        { label: "Security", href: "#faq" },
      ],
    },
  ] satisfies FooterColumn[],
  image: { src: "/images/footer-valley.webp", alt: "" },
};

export const images = {
  heroHills: "/images/hero-hills.webp",
  overviewMountains: "/images/overview-mountains.webp",
  insightsMeadow: "/images/insights-meadow.webp",
} as const;

/* ---------- In-app mock data ---------- */

export const appUser = { greeting: "Good Morning,", name: "Rafael Leao" };

export const walletCards: WalletCard[] = [
  { name: "Investment", balance: 24972, tone: "bg-[#f7a531]" },
  { name: "Personal", balance: 11890.76, tone: "bg-[#2f6df6]" },
];

export const quickActions: QuickAction[] = [
  { label: "Send", icon: Send },
  { label: "Receive", icon: ArrowDownToLine },
  { label: "QR", icon: QrCode },
  { label: "Top Up", icon: CirclePlus },
  { label: "History", icon: History },
];

export const transactions: Transaction[] = [
  {
    merchant: "Starbucks",
    category: "Food & Drink",
    amount: -8.5,
    date: "Today, 8:24 AM",
    icon: Coffee,
    tone: "bg-[#f3ead9] text-[#7a5a2a]",
  },
  {
    merchant: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    date: "Yesterday",
    icon: Clapperboard,
    tone: "bg-[#1b1b1b] text-[#ff4b55]",
  },
  {
    merchant: "Apple Store",
    category: "Shopping",
    amount: -129,
    date: "Aug 12, 3:16 PM",
    icon: ShoppingBag,
    tone: "bg-[#fbeede] text-[#c07a2c]",
  },
  {
    merchant: "Payroll",
    category: "Salary",
    amount: 3850,
    date: "Aug 10, 9:00 AM",
    icon: Banknote,
    tone: "bg-[#dff3e3] text-[#2f8a4a]",
  },
  {
    merchant: "Uber",
    category: "Transport",
    amount: -23.4,
    date: "Aug 9, 7:42 PM",
    icon: CarFront,
    tone: "bg-[#ececef] text-[#1c1c1e]",
  },
];

export const holdings: Holding[] = [
  {
    name: "Emergency Fund",
    value: 1238.97,
    totalReturn: 99,
    icon: PiggyBank,
    tone: "bg-[#ece6fe] text-violet",
  },
  {
    name: "Technology Fund",
    value: 6548,
    totalReturn: 468.35,
    icon: Cpu,
    tone: "bg-[#ffeedc] text-[#e5822a]",
  },
  {
    name: "Global Equity ETF",
    value: 4882.15,
    totalReturn: 1037.41,
    icon: Globe,
    tone: "bg-[#e3ebff] text-[#3d63e0]",
  },
  {
    name: "Green Energy Fund",
    value: 2410.6,
    totalReturn: -38.2,
    icon: Leaf,
    tone: "bg-[#e0f4e5] text-[#2f8a4a]",
  },
];

export const paymentMethods: PaymentMethod[] = [
  { bank: "Chase Bank", account: "Checking •••• 2021", mark: "C", tone: "bg-[#1a5bb8]" },
  { bank: "Bank of America", account: "Checking •••• 4458", mark: "B", tone: "bg-[#d4202c]" },
  { bank: "Wells Fargo", account: "Savings •••• 1274", mark: "W", tone: "bg-[#c8102e]" },
  { bank: "Citibank", account: "Checking •••• 8820", mark: "c", tone: "bg-[#0f64c8]" },
];

export const portfolioSummary = {
  assets: 24972,
  change: "12.5%",
  cash: 2623,
  ranges: ["1D", "1W", "1M", "3M", "1Y"],
  activeRange: "1M",
};
