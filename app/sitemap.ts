import type { MetadataRoute } from "next";

import { ROUTES } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

/**
 * The landing page and the legal pages: /notes is the app itself (empty until someone writes,
 * all content stays in their browser), so it's marked noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/opengraph-image.jpg")],
    },
    ...[ROUTES.privacy, ROUTES.terms].map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
