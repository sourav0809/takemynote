import type { StaticImageData } from "next/image";

import lockupDark from "./assets/logos/bookmark/lockup-dark.png";
import lockup from "./assets/logos/bookmark/lockup.png";
import mark from "./assets/logos/bookmark/mark.png";

export interface BrandLogoSet {
  /** The symbol alone (onboarding, favicon source). */
  mark: StaticImageData;
  /** Symbol + "TakeMyNote" with navy lettering, for light backgrounds. */
  lockup: StaticImageData;
  /** The same lockup with light lettering, for dark mode. */
  lockupDark: StaticImageData;
}

/**
 * The TakeMyNote logo ("Bookmark": two stacked note cards with a ribbon).
 * Generated with scripts/generate-logo.mjs, processed with
 * `node scripts/build-brand.mjs bookmark --icons`, which also writes the favicons.
 */
export const activeLogo: BrandLogoSet = { mark, lockup, lockupDark };
