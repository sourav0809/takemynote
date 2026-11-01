import { APP_NAME, GITHUB_URL } from "@/lib/constants";

/**
 * Everything search engines and link previews (WhatsApp, iMessage, Slack, X,
 * LinkedIn…) read about the site, in one place. Page metadata, robots.txt,
 * the sitemap and the JSON-LD all come from here.
 */

/** Canonical origin. Override with NEXT_PUBLIC_SITE_URL when the domain changes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.takemynote.online").replace(/\/$/, "");

/** ~55 characters: fits Google's title width. */
export const SITE_TITLE = `${APP_NAME}: Free, Private Notes App with AI`;

/** ~155 characters: fits Google's snippet. */
export const SITE_DESCRIPTION =
  "A calm, private notebook that lives in your browser. Rich editor, 21 free templates and AI with your own key. No sign-up, no ads, open source.";

/** Short version for link previews, where space is tight. */
export const SHARE_DESCRIPTION =
  "Private notes in your browser. Rich editor, free templates and AI with your own key. No sign-up needed.";

export const SITE_KEYWORDS = [
  "notes app",
  "note taking app",
  "private notes",
  "online notepad",
  "notes app no sign up",
  "free notes app",
  "open source notes app",
  "local-first notes",
  "markdown notes",
  "AI notes",
  "AI writing assistant",
  "bring your own API key",
  "note templates",
  "daily planner template",
  "meeting notes template",
  "Notion alternative",
  "Apple Notes alternative",
  "Google Keep alternative",
  "TakeMyNote",
];

export const AUTHOR = { name: "Sourav Pathak", url: "https://github.com/sourav0809" };

export const SOCIAL_PROFILES = [GITHUB_URL];

/**
 * The link-preview image (app/opengraph-image.jpg). The root picks it up by
 * file convention; layouts that set their own openGraph must list it again,
 * because Next replaces openGraph rather than merging it.
 */
export const SHARE_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: `${APP_NAME}: calm notes that stay in your browser, shown next to the app with a note open`,
};

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
