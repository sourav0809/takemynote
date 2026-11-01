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
 * The "Page TN" logo in assets/logos/page-tn is only used for Google's sign-in
 * branding, not in the app.
 */
export const activeLogo: BrandLogoSet = { mark, lockup, lockupDark };
