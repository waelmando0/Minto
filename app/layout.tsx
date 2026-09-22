import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/navbar";
import { mintoMeta } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: mintoMeta.title,
    template: `%s · ${mintoMeta.name}`,
  },
  description: mintoMeta.description,
  keywords: [...mintoMeta.keywords],
  applicationName: mintoMeta.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: mintoMeta.name,
    title: mintoMeta.title,
    description: mintoMeta.description,
    images: [{ url: "/images/hero-hills.webp", width: 1179, height: 558, alt: "Rolling green hills" }],
  },
  twitter: {
    card: "summary_large_image",
    title: mintoMeta.title,
    description: mintoMeta.description,
    images: ["/images/hero-hills.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
