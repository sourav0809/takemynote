import type { StaticImageData } from "next/image";

import lockupDark from "./assets/logos/page-tn/lockup-dark.png";
import lockup from "./assets/logos/page-tn/lockup.png";
import mark from "./assets/logos/page-tn/mark.png";

export interface BrandLogoSet {
  /** The symbol alone (onboarding, favicon source). */
  mark: StaticImageData;
  /** Symbol + "TakeMyNote" with navy lettering, for light backgrounds. */
  lockup: StaticImageData;
  /** The same lockup with light lettering, for dark mode. */
  lockupDark: StaticImageData;
}

/**
 * The TakeMyNote logo ("Page TN": a blue note with a folded corner and a T and
 * N sharing one stem). It replaced "Bookmark" (two stacked note cards), which
 * Google's sign-in branding review found too generic; those files are kept in
 * assets/logos/bookmark for now. Processed with
 * `node scripts/build-brand.mjs page-tn --icons`, which also writes the favicons.
 */
export const activeLogo: BrandLogoSet = { mark, lockup, lockupDark };
