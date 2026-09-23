"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { NavigationMenu } from "radix-ui";

import { LoginDialog } from "@/components/login-dialog";
import { MintoLogo } from "@/components/logo";
import { StoreButtons, pillVariants } from "@/components/store-buttons";
import { useScrolled } from "@/hooks/use-scrolled";
import { useSignedIn } from "@/hooks/use-signed-in";
import { navGroups as defaultGroups } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { NavGroup, NavMenuItem } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Section links like `#faq` point at the home page when the navbar is shown elsewhere. */
function withHomeAnchors(groups: NavGroup[]): NavGroup[] {
  const fix = (href: string) => (href.startsWith("#") ? `/${href}` : href);
  return groups.map((group) => ({
    ...group,
    href: group.href && fix(group.href),
    items: group.items?.map((item) => ({ ...item, href: fix(item.href) })),
  }));
}

export function Navbar({ groups: sectionGroups = defaultGroups }: { groups?: NavGroup[] }) {
  const onHome = usePathname() === "/";
  const groups = React.useMemo(() => (onHome ? sectionGroups : withHomeAnchors(sectionGroups)), [onHome, sectionGroups]);
  const signedIn = useSignedIn();
  const scrolled = useScrolled(24);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "relative mx-auto max-w-[1200px] rounded-2xl bg-white/85 ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300",
          scrolled || mobileOpen
            ? "shadow-[0_12px_32px_-16px_rgb(0_0_0/0.28)]"
            : "shadow-[0_4px_18px_-10px_rgb(0_0_0/0.12)]",
        )}
      >
        <div className="relative flex h-12 items-center justify-between pr-1.5 pl-4">
          <MintoLogo href={onHome ? "#top" : "/"} />

          <DesktopMenu groups={groups} />

          <div className="flex items-center gap-1.5">
            {signedIn ? (
              <Link href="/account" className={cn(pillVariants({ tone: "dark", size: "md" }), "normal-case tracking-normal")}>
                Account
              </Link>
            ) : (
              <LoginDialog>
                <button type="button" className={cn(pillVariants({ tone: "dark", size: "md" }), "normal-case tracking-normal")}>
                  Login
                </button>
              </LoginDialog>
            )}
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full text-[#111] transition-colors hover:bg-black/5 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls={panelId}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        <MobileMenu id={panelId} open={mobileOpen} groups={groups} onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}

function DesktopMenu({ groups }: { groups: NavGroup[] }) {
  return (
    <NavigationMenu.Root
      delayDuration={80}
      className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
      aria-label="Main"
    >
      <NavigationMenu.List className="flex items-center gap-1">
        {groups.map((group) =>
          group.items ? (
            <NavigationMenu.Item key={group.label} className="relative">
              <NavigationMenu.Trigger className="group flex h-9 items-center gap-1 rounded-full px-3.5 text-[13px] font-medium text-[#1a1a1a] transition-colors outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black data-[state=open]:bg-black/[0.04]">
                {group.label}
                <ChevronDown
                  aria-hidden
                  className="size-3 text-black/45 transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute top-full left-1/2 -translate-x-1/2 pt-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1">
                <ul className="grid w-[480px] grid-cols-2 gap-1 rounded-2xl bg-white p-2 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.3)] ring-1 ring-black/5">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <MenuLink item={item} />
                    </li>
                  ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ) : (
            <NavigationMenu.Item key={group.label}>
              <NavigationMenu.Link asChild>
                <Link
                  href={group.href ?? "#"}
                  className="flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium text-[#1a1a1a] transition-colors outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black"
                >
                  {group.label}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ),
        )}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}

function MenuLink({ item }: { item: NavMenuItem }) {
  const Icon = item.icon;
  return (
    <NavigationMenu.Link asChild>
      <Link
        href={item.href}
        className="group flex gap-3 rounded-xl p-3 transition-colors outline-none hover:bg-[#f5f5f3] focus-visible:bg-[#f5f5f3] focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint text-mint-foreground transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[#111]">{item.label}</span>
          <span className="text-xs leading-snug text-[#6b6b70]">{item.description}</span>
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

function MobileMenu({
  id,
  open,
  groups,
  onNavigate,
}: {
  id: string;
  open: boolean;
  groups: NavGroup[];
  onNavigate: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={id}
          key="mobile-menu"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
          className="overflow-hidden lg:hidden"
        >
          <nav aria-label="Main" className="max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-black/5 px-4 pt-4 pb-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {groups.map((group) =>
                group.items ? (
                  <div key={group.label}>
                    <p className="text-[11px] font-medium tracking-[0.08em] text-[#8a8a8f] uppercase">{group.label}</p>
                    <ul className="mt-2 grid gap-0.5">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-[#111] transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                          >
                            <item.icon className="size-4 text-[#6b6b70]" aria-hidden />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    key={group.label}
                    href={group.href ?? "#"}
                    onClick={onNavigate}
                    className="self-start rounded-lg px-2 py-2 text-sm font-medium text-[#111] hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                  >
                    {group.label}
                  </Link>
                ),
              )}
            </div>
            <StoreButtons className="mt-6 justify-start" />
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
