// Generates one landing-page image with OpenAI and saves the raw PNG.
// Usage: node scripts/generate-image.mjs <preset> [outDir]
// Reads OPEN_AI_API_KEY from the git-ignored .env and never prints it.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MODEL = "gpt-image-2";

const CALM_RULES =
  "Calm, LOW SATURATION, soft, muted, airy, high-key, gentle haze, nothing vivid. Smooth gradients, sharp, no noise. No people, animals, buildings, roads, text, logos or watermark.";

const PRESETS = {
  hero: {
    size: "3456x2304",
    prompt: `Wide 3:2 website hero background behind dark headline text, for a clean minimal white website. ${CALM_RULES} The top 70% is open sky, very pale near the top, centre empty and smooth with no detailed clouds. The horizon is at about 70% from the top; landscape fills only the bottom 30%. Style: quiet coastal sand dunes at early morning, very pale warm-white sky fading to a faint soft apricot glow at the horizon, a distant calm sea line dissolving into sea mist, low rolling pale sand dunes in the bottom band with soft shadows, small tufts of pale sage dune grass only at the far left and right edges, warm stone and sand palette, photographic.`,
  },
  closing: {
    size: "2400x1600",
    prompt: `Wide 3:2 background image for a call-to-action card on a clean minimal white website, with dark text placed over the LEFT half. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. A pale late-afternoon sky in soft lilac and very pale butter yellow with a few large soft sculpted cumulus clouds on the RIGHT side, catching a faint warm golden light. The left half of the image is open, smooth, very pale sky with no detail. Small foliage only in the bottom corners: a few tall stems of pale meadow grass and small cream wildflowers entering from the bottom-left corner, and the soft rounded canopy of a sage-green tree in the bottom-right corner. No ground, no horizon line, no buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  logo: {
    size: "1024x1024",
    prompt: `A premium, minimal app icon for a note-taking app called TakeMyNote. A single rounded-square tile (iOS app icon shape, soft continuous corners) centred on a pure white background, the tile filling about 88% of the canvas. The tile is a deep plum-ink colour (#241b2f), flat with a very subtle top-to-bottom tonal gradient. On the tile: one simple, bold, geometric white note page with its top-right corner folded over, centred, and a single short, thick, rounded highlighter stroke in soft butter yellow (#fde68a) running horizontally across the middle of the page like a highlighted line, plus one thin grey-plum line below it. Flat vector style, crisp clean edges, generous padding, perfectly symmetrical, readable at 16 pixels. No text, no letters, no drop shadow outside the tile, no 3D, no gloss, no extra decoration, no watermark.`,
  },
};

async function main() {
  const [presetName, outDir = path.join(process.cwd(), ".generated")] = process.argv.slice(2);
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown preset "${presetName}". Use one of: ${Object.keys(PRESETS).join(", ")}`);
  }

  process.loadEnvFile(".env");
  const apiKey = process.env.OPEN_AI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPEN_AI_API_KEY is missing from .env");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: preset.prompt,
      size: preset.size,
      quality: "high",
      n: 1,
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message ?? `HTTP ${response.status}`);

  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${presetName}.png`);
  await writeFile(outFile, Buffer.from(json.data[0].b64_json, "base64"));
  console.log(`Saved ${outFile}`);
}

await main();
