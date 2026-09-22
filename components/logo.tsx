import Link from "next/link";

import { cn } from "@/lib/utils";

/** The Minto ring: an off-centre cut-out gives the mark its sense of motion. */
export function MintoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={cn("size-5", className)}>
      <path
        fillRule="evenodd"
        d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm1.2 5.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Z"
      />
    </svg>
  );
}

export function MintoLogo({ className, href = "#top" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Minto home"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-[17px] font-medium tracking-[-0.03em]",
        className,
      )}
    >
      <MintoMark />
      <span>Minto</span>
    </Link>
  );
}
