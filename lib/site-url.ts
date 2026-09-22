/**
 * Public origin of the deployment, used for canonical URLs, Open Graph tags,
 * the sitemap and robots. Override with NEXT_PUBLIC_SITE_URL (e.g. for a custom domain).
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minto.vercel.app";
