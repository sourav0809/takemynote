import { GITHUB_URL } from "@/lib/constants";

const REPO_API_URL = GITHUB_URL.replace("https://github.com/", "https://api.github.com/repos/");
const ONE_HOUR_SECONDS = 3600;

/** Below this, a star count reads as "nobody uses it", so we show none. */
export const MIN_STARS_TO_SHOW = 10;

/**
 * The repo's star count, fetched on the server and cached for an hour (the
 * browser never calls GitHub). Null when GitHub can't be reached.
 */
export async function getGithubStars(): Promise<number | null> {
  try {
    const response = await fetch(REPO_API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: ONE_HOUR_SECONDS },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/** 1234 → "1.2k". */
export function formatStarCount(stars: number): string {
  return stars >= 1000 ? `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(stars);
}
