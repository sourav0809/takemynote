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
    prompt: `Wide 3:2 website hero background behind dark headline text, for a clean minimal white website. ${CALM_RULES} The top 70% is open sky, very pale near the top, centre empty and smooth with no detailed clouds. The horizon is at about 70% from the top; landscape fills only the bottom 30%. Style: quiet coastal dunes at blue hour, very pale powder-blue and silver sky fading to a soft light-blue glow at the horizon, a distant calm sea line in pale steel blue dissolving into sea mist, low rolling pale sand dunes in cool silver-grey light with soft blue shadows in the bottom band, small tufts of pale blue-green dune grass only at the far left and right edges, cool muted blue-grey palette, photographic.`,
  },
  auth: {
    size: "1024x1536",
    prompt: `Tall portrait 2:3 image for the left panel of a sign-in dialog on a clean minimal white website; a small dark logo and one short line of dark text sit over the TOP-LEFT area. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. The top half is open, smooth, very pale powder-blue morning sky with no detail, then a few large soft sculpted white cumulus clouds catching faint cool silver light in the middle. The bottom quarter: a calm, glassy pale-blue lake with soft reflections, and tall stems of pale meadow grass with a few small pale-blue wildflowers rising from the bottom-left and bottom-right corners. No buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  "auth-share": {
    size: "1024x1536",
    prompt: `Tall portrait 2:3 image for the left panel of a sign-in dialog on a clean minimal white website; dark text sits over the TOP-LEFT and BOTTOM-LEFT areas. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. A very pale powder-blue sky with soft wisps of cloud. Three small folded white paper airplanes glide gently upward on a soft curve across the middle of the image, catching faint cool silver light, with faint airy trails. A low band of pale blue-green rolling hills and a few tall meadow grasses at the very bottom. Large calm open areas at the top-left. No buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  "auth-ai": {
    size: "1024x1536",
    prompt: `Tall portrait 2:3 image for the left panel of a sign-in dialog on a clean minimal white website; dark text sits over the TOP-LEFT and BOTTOM-LEFT areas. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. Early morning over a quiet pale meadow: soft rays of cool sunlight falling diagonally through a pale powder-blue sky, a single gentle blue-green tree on the right side, tiny drifting motes of light in the air, pale meadow grass and small pale-blue wildflowers along the bottom. Large calm open sky at the top-left. No buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  "auth-templates": {
    size: "1024x1536",
    prompt: `Tall portrait 2:3 image for the left panel of a sign-in dialog on a clean minimal white website; dark text sits over the TOP-LEFT and BOTTOM-LEFT areas. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. Layered pale blue-grey mountain ridges receding into soft morning mist, each layer slightly paler, under a very pale powder-blue sky with a few soft clouds; a calm pale lake at the bottom reflecting the ridges, with a few slender reeds in the bottom-left corner. Large calm open sky at the top-left. No buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  closing: {
    size: "2400x1600",
    prompt: `Wide 3:2 background image for a call-to-action card on a clean minimal white website, with dark text placed over the LEFT half. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. A pale morning sky in soft powder blue and very pale sky blue with a few large soft sculpted white cumulus clouds on the RIGHT side, catching a faint cool silver light. The left half of the image is open, smooth, very pale blue sky with no detail. Small foliage only in the bottom corners: a few tall stems of pale meadow grass and small pale-blue wildflowers entering from the bottom-left corner, and the soft rounded canopy of a blue-green tree in the bottom-right corner. No ground, no horizon line, no buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  "feature-write": {
    size: "2400x1600",
    prompt: `Wide 3:2 background image for a feature card on a clean minimal white website; a light UI window will sit on top in the centre. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. A calm wide lake in early morning: glassy pale powder-blue water with soft reflections, a very pale sky with a faint silver haze, distant soft blue-grey hills along a low horizon, a few slender pale reeds only in the bottom-left corner. Large calm open areas, no strong focal point. No people, animals, buildings, boats, text, logos or watermark. Smooth gradients, sharp, no noise.`,
  },
  "feature-private": {
    size: "1536x1024",
    prompt: `A calm still-life photograph for a website feature card about privacy. A closed, plain linen-covered notebook in soft off-white with a small brass clasp and a tiny brass padlock, lying on a pale warm-stone surface, against a smooth, very pale powder-blue wall. Soft window light from the left with a faint diagonal light shaft, gentle soft shadow. Camera at table height; the notebook is about a third of the frame width, centred slightly right, with clear empty space on every side. Low saturation, high-key, minimal, premium, sharp focus. No text, no logos, no people, no other objects.`,
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
