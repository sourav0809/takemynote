import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

/**
 * Only the landing page: /notes is the app itself (empty until someone writes,
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
  ];
}
