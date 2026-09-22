import type { SVGProps } from "react";

/** Brand marks are not part of Lucide, so they are drawn here. */

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.37 12.73c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.66ZM14.1 5.98c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.8 1.01.08 2.05-.52 2.68-1.28Z" />
    </svg>
  );
}

export function PlayStoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="#00d7fe" d="M3.6 2.3c-.2.2-.3.6-.3 1v17.4c0 .4.1.8.3 1l.1.1 9.7-9.7v-.2L3.7 2.2l-.1.1Z" />
      <path fill="#ffce00" d="m16.6 15.3-3.2-3.2v-.2l3.2-3.2h.1l3.8 2.2c1.1.6 1.1 1.6 0 2.2l-3.8 2.2h-.1Z" />
      <path fill="#ff3a44" d="M16.7 15.2 13.4 12l-9.8 9.7c.4.4.9.4 1.6.1l11.5-6.6" />
      <path fill="#00f076" d="M16.7 8.8 5.2 2.2c-.7-.4-1.2-.3-1.6.1l9.8 9.7 3.3-3.2Z" />
    </svg>
  );
}
