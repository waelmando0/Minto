"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Lifts its children as the page scrolls past the hero: a gentle parallax. */
export function HeroParallax({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], reduce ? [0, 0] : [0, -90], { clamp: true });

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
