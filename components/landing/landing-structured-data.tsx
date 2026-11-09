import { FAQJsonLd, JsonLdScript, OrganizationJsonLd, SoftwareApplicationJsonLd } from "next-seo";

import { FAQ_ITEMS } from "@/components/landing/landing-content";
import { APP_NAME } from "@/lib/constants";
import { absoluteUrl, AUTHOR, SITE_DESCRIPTION, SITE_URL, SOCIAL_PROFILES } from "@/lib/seo";

const FEATURES = [
  "Rich text editor with headings, lists, task lists, tables and code blocks",
  "AI editing and writing with your own OpenAI, Google or Anthropic key",
  "21 free templates for planning, work, personal life and writing",
  "Notes stay in your browser: no account or sign-up",
  "Search, favorites, categories, trash and a scratchpad",
  "Download as PDF, Markdown, text, HTML or JSON, and one-file backups",
  "Light and dark mode, two layouts and keyboard shortcuts",
];

/**
 * Structured data (JSON-LD) for search engines: the app itself (free web app
 * with screenshots and features), who makes it, the site, and the FAQ.
 */
// next-seo uses scriptKey as the script's id, so keys are prefixed: a plain
// "faq" would share the FAQ section's id and break the "#faq" nav link.
export function LandingStructuredData() {
  return (
    <>
      <SoftwareApplicationJsonLd
        type="WebApplication"
        name={APP_NAME}
        description={SITE_DESCRIPTION}
        url={SITE_URL}
        image={absoluteUrl("/icons/icon-512.png")}
        screenshot={absoluteUrl("/opengraph-image.jpg")}
        applicationCategory="ProductivityApplication"
        applicationSubCategory="Note-taking"
        operatingSystem="Any (runs in a web browser)"
        featureList={FEATURES}
        offers={{ price: 0, priceCurrency: "USD" }}
        author={{ name: AUTHOR.name, url: AUTHOR.url }}
        scriptKey="jsonld-software-application"
      />
      <OrganizationJsonLd
        name={APP_NAME}
        url={SITE_URL}
        logo={absoluteUrl("/icons/icon-512.png")}
        sameAs={SOCIAL_PROFILES}
        scriptKey="jsonld-organization"
      />
      <JsonLdScript
        scriptKey="jsonld-website"
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: APP_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
          inLanguage: "en",
        }}
      />
      <FAQJsonLd
        questions={FAQ_ITEMS.map(({ question, answer }) => ({ question, answer }))}
        scriptKey="jsonld-faq"
      />
    </>
  );
}
