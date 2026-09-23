# Minto

Marketing site for **Minto**, a personal-finance app that brings together everyday spending, investments and savings goals. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui-style primitives on Radix**, **Framer Motion** and **Lucide** icons.

> The Minto **mobile app** (Expo / React Native) lives in [`mobile/`](mobile/README.md). It has its own dependencies and checks, and the website build ignores it. Its optional **Supabase backend** (schema, row-level security, server functions, tests) lives in [`supabase/`](supabase/README.md).

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

The site URL used for canonical URLs, the sitemap and Open Graph tags defaults to `https://creatorix-w5pn.vercel.app` (see `lib/site-url.ts`). Set `NEXT_PUBLIC_SITE_URL` to override it, e.g. when you add a custom domain.

## Web sign-in (optional)

The navbar's **Login** signs people in with the same Supabase project as the mobile app. It emails a one-time code, and the **/account** page then shows their balances, recent activity and goals. The page is read-only; money moves only in the app. Without Supabase settings the site still builds and works, and Login says sign-in isn't available.

Codes are requested and checked **from the visitor's browser**, not the server. Supabase Auth rate-limits sign-in per IP address, and from the server every visitor would share the host's IPs.

Every response also sends security headers (`next.config.ts`). They block framing (clickjacking) and MIME sniffing, send a strict referrer policy, turn off camera, microphone and location access, and set HSTS.

1. Set up the project as described in [`supabase/README.md`](supabase/README.md).
2. Copy `.env.example` to `.env.local` (for Vercel: **Settings → Environment Variables**) and fill in **Project Settings → API Keys**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   ```
   `NEXT_PUBLIC_SUPABASE_KEY` or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` work too. Never use a secret or `service_role` key.
3. In Supabase, **Authentication → URL Configuration**: set **Site URL** to the website's address and add `https://<your-site>/auth/callback` under **Redirect URLs**. This lets the link in the email sign people in too.
4. Redeploy. `NEXT_PUBLIC_…` values are built into the site.

## Project structure

```
app/
  layout.tsx            # Root layout: font, metadata, navbar, skip link
  page.tsx              # Home: composes the sections + JSON-LD
  actions/login.ts      # Server Action: sign out
  account/              # Signed-in overview (balances, activity, goals), read-only
  auth/callback/        # Where the sign-in link in the email lands
  not-found.tsx sitemap.ts robots.ts icon.svg globals.css
components/
  sections/             # hero, about (+ highlights), overview, invest, insights, faq, footer
  app-ui/               # in-app mockups: wallet, quick actions, transactions, portfolio, charts, screens
  ui/                   # design-system primitives (Button, Dialog, Input, Label)
  motion/reveal.tsx     # Reveal / Stagger scroll animations
  phone-frame.tsx       # CSS-only phone; its screen is an `app-ui` container
  navbar.tsx login-dialog.tsx store-buttons.tsx logo.tsx brand-icons.tsx primitives.tsx container.tsx
hooks/                  # useScrolled, useSignedIn
lib/
  content.ts            # All copy, links and in-app mock data: edit content here
  supabase/             # Project settings, the browser client and the per-request server client
  login-client.ts       # Sends and checks sign-in codes from the browser
  account.ts            # Reads the signed-in user's data
  chart.ts format.ts login.ts site-url.ts utils.ts
proxy.ts                # Refreshes the Supabase session before /account renders
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

- **Login:** Supabase email codes, see [Web sign-in](#web-sign-in-optional).
- **Store links:** `mintoMeta.appStoreUrl` / `playStoreUrl` in `lib/content.ts`.

## Imagery

The landscape images in `public/images` were extracted from the design reference and are fairly low resolution. For production, replace them with the original high-resolution assets under the same file names.
