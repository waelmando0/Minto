# Minto

Marketing site for **Minto**, a personal-finance app that brings together everyday spending, investments and savings goals. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui-style primitives on Radix**, **Framer Motion** and **Lucide** icons.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` in production (read in `lib/site-url.ts`) so canonical URLs, the sitemap and Open Graph tags point at your domain.

## Project structure

```
app/
  layout.tsx            # Root layout: font, metadata, navbar, skip link
  page.tsx              # Home: composes the sections + JSON-LD
  actions/login.ts      # Server Action behind the passwordless login dialog
  not-found.tsx sitemap.ts robots.ts icon.svg globals.css
components/
  sections/             # hero, about (+ highlights), overview, invest, insights, faq, footer
  app-ui/               # in-app mockups: wallet, quick actions, transactions, portfolio, charts, screens
  ui/                   # design-system primitives (Button, Dialog, Input, Label)
  motion/reveal.tsx     # Reveal / Stagger scroll animations
  phone-frame.tsx       # CSS-only phone; its screen is an `app-ui` container
  navbar.tsx login-dialog.tsx store-buttons.tsx logo.tsx brand-icons.tsx primitives.tsx container.tsx
hooks/                  # useScrolled
lib/
  content.ts            # All copy, links and in-app mock data: edit content here
  chart.ts format.ts login.ts site-url.ts utils.ts
types/                  # Shared domain types
public/images/          # Landscape plates
```

## Implementation notes

- **Server first.** Sections are Server Components. Client code is limited to the navbar (Radix dropdown menus, animated mobile menu), the login dialog, the accordions and the hero parallax.
- **Content is data.** Every string, link and mock figure lives in `lib/content.ts`, so components stay presentational.
- **Mockups are real UI, not screenshots.** Phone screens and card previews are composed from small `app-ui` components. The `app-ui` utility (in `globals.css`) makes the element a size container and rebinds `--spacing`, `--text-*` and `--radius` to `cqw`. The same markup therefore scales from a 220px card preview to a 420px phone.
- **Locked art boards.** The hero and overview landscapes were retouched where the reference phone stood. `ArtStage` keeps each landscape and its phone in fixed proportions, so the phone always covers that area. Below a minimum width the board is cropped at the sides. Past 1280px it stops growing and fades into the page.
- **Motion.** The hero entrance is pure CSS, so the headline paints before hydration. Framer Motion drives the parallax, scroll reveals, staggers and the mobile menu. Everything respects `prefers-reduced-motion`.
- **Accessibility.** Semantic landmarks, a skip link, visible focus rings, keyboard-operable Radix menus, accordions and dialog, and labelled icon buttons. The decorative mockups are hidden from assistive technology and described by a single label.
- **SEO.** Metadata API with canonical URL and Open Graph/Twitter cards, a sitemap, robots, and `MobileApplication` + `FAQPage` JSON-LD.

## Integration points

- **Login:** connect your auth provider's magic-link / OTP flow in `app/actions/login.ts`.
- **Store links:** `mintoMeta.appStoreUrl` / `playStoreUrl` in `lib/content.ts`.

## Imagery

The landscape images in `public/images` were extracted from the design reference and are fairly low resolution. For production, replace them with the original high-resolution assets under the same file names.
