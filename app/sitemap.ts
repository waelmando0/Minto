import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/support`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
