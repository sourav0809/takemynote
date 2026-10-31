// Generates TakeMyNote logo lockup concepts (mark + wordmark) with OpenAI or Gemini.
// Usage: node scripts/generate-logo.mjs <concept> [outDir=.generated/logos]
// Reads OPEN_AI_API_KEY / GEMINI_API_KEY from the git-ignored .env and never prints them.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OPENAI_MODEL = "gpt-image-2";
const GEMINI_MODEL = "gemini-3-pro-image";

const SHARED = `A professional horizontal logo lockup for a calm, private note-taking app named "TakeMyNote".
Layout: a single icon mark on the LEFT and the wordmark "TakeMyNote" on the RIGHT, vertically centred, on a pure flat white background, with generous empty margin all around (the lockup fills about 70% of the width).
The wordmark must read exactly "TakeMyNote" — capital T, M and N, no other letters, no spaces, no tagline, no other text anywhere.
Colours: brand blue #0069a8 for the mark, a lighter sky blue #38bdf8 as a small accent, and deep navy #0b1b2b for the wordmark.
Flat vector style, crisp clean edges, no gradients except a very subtle one inside the mark, no shadows, no 3D, no mockup, no background shapes, no watermark. Premium, modern, friendly, simple enough to work as a 16px favicon.`;

const CONCEPTS = {
  fold: {
    provider: "openai",
    prompt: `${SHARED}
Mark: a rounded-square app tile in brand blue containing a white note page whose top-right corner is folded over; the fold and two short text lines subtly form a capital "T". Wordmark: clean geometric sans-serif, "Take" in medium weight and "MyNote" in semibold, tight but readable letter spacing.`,
  },
  quill: {
    provider: "openai",
    prompt: `${SHARED}
Mark: a soft circular badge in brand blue with a single flowing white stroke that starts as a pen nib and ends as a checkmark, suggesting "write it down, done". Wordmark: friendly rounded sans-serif in semibold, with the dot-free, smooth letterforms; "Note" slightly bolder than "TakeMy".`,
  },
  bookmark: {
    provider: "gemini",
    prompt: `${SHARED}
Mark: a minimal stack of two offset note cards (back card sky blue, front card brand blue) with a small white bookmark ribbon notch at the top of the front card. Wordmark: modern humanist sans-serif in semibold, single colour navy, excellent kerning.`,
  },
  monogram: {
    provider: "gemini",
    prompt: `${SHARED}
Mark: an elegant monogram built from the letters "t" and "n" sharing one continuous stroke, drawn in brand blue inside a squircle outline, with one sky-blue dot like an ink drop. Wordmark: crisp geometric sans-serif, "Take" regular weight and "MyNote" bold, all navy.`,
  },
};

async function generateWithOpenAI(prompt) {
  const apiKey = process.env.OPEN_AI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPEN_AI_API_KEY is missing from .env");
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: OPENAI_MODEL, prompt, size: "1536x1024", quality: "high", n: 1 }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message ?? `OpenAI HTTP ${response.status}`);
  return Buffer.from(json.data[0].b64_json, "base64");
}

async function generateWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing from .env");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "3:2" } },
      }),
    }
  );
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message ?? `Gemini HTTP ${response.status}`);
  const part = json.candidates?.[0]?.content?.parts?.find((item) => item.inlineData);
  if (!part) throw new Error("Gemini returned no image");
  return Buffer.from(part.inlineData.data, "base64");
}

async function main() {
  const [conceptName, outDir = path.join(process.cwd(), ".generated", "logos")] = process.argv.slice(2);
  const concept = CONCEPTS[conceptName];
  if (!concept) throw new Error(`Unknown concept "${conceptName}". Use: ${Object.keys(CONCEPTS).join(", ")}`);

  process.loadEnvFile(".env");
  const image =
    concept.provider === "openai"
      ? await generateWithOpenAI(concept.prompt)
      : await generateWithGemini(concept.prompt);

  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${conceptName}.png`);
  await writeFile(outFile, image);
  console.log(`Saved ${outFile} (${concept.provider})`);
}

await main();
