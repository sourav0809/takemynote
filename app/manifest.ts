import type { MetadataRoute } from "next";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { SHARE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: ROUTES.notes,
    name: APP_NAME,
    short_name: APP_NAME,
    description: SHARE_DESCRIPTION,
    lang: "en",
    categories: ["productivity", "utilities"],
    start_url: ROUTES.notes,
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#fafafa",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
