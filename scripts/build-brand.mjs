// Turns a generated logo lockup (mark + wordmark on white) into brand assets:
// transparent lockup (light + dark), the mark alone, and — with --icons — the
// favicon, app icons and manifest icons.
// Usage: node scripts/build-brand.mjs bookmark --icons

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const CONCEPTS = ["bookmark", "page-tn"];
const SOURCE_DIR = ".generated/logos";
const OUT_DIR = "components/brand/assets/logos";
const WHITE_THRESHOLD = 236; // channels above this count as background white
const DARK_WORDMARK_RGB = [245, 245, 244];

async function readRaw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const isWhite = (data, i) =>
  data[i] > WHITE_THRESHOLD && data[i + 1] > WHITE_THRESHOLD && data[i + 2] > WHITE_THRESHOLD;

/** Column index where the mark ends and the wordmark begins (widest empty gap). */
function findSplitColumn({ data, width, height }) {
  const inked = Array.from({ length: width }, (_, x) => {
    for (let y = 0; y < height; y++) if (!isWhite(data, (y * width + x) * 4)) return true;
    return false;
  });
  const first = inked.indexOf(true);
  let best = { start: 0, length: 0 };
  let gapStart = -1;
  for (let x = first; x < width; x++) {
    if (!inked[x] && gapStart < 0) gapStart = x;
    if (inked[x] && gapStart >= 0) {
      if (x - gapStart > best.length) best = { start: gapStart, length: x - gapStart };
      gapStart = -1;
    }
  }
  return best.start + Math.floor(best.length / 2);
}

/** White → transparent everywhere, un-mixing anti-aliased edges (for lettering). */
function whiteToAlpha(raw) {
  const out = Buffer.from(raw.data);
  for (let i = 0; i < out.length; i += 4) {
    const alpha = 255 - Math.min(out[i], out[i + 1], out[i + 2]);
    if (alpha <= 2) {
      out[i + 3] = 0;
      continue;
    }
    const a = alpha / 255;
    for (let c = 0; c < 3; c++) out[i + c] = Math.max(0, Math.round((out[i + c] - 255 * (1 - a)) / a));
    out[i + 3] = alpha;
  }
  return { ...raw, data: out };
}

/** Removes only the white connected to the border, keeping white inside the mark. */
function floodBackground(raw) {
  const { width, height } = raw;
  const out = Buffer.from(raw.data);
  const seen = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !isWhite(out, p * 4)) continue;
    seen[p] = 1;
    out[p * 4 + 3] = 0;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
  // Soften the edge: light pixels touching the removed area fade by whiteness.
  for (let p = 0; p < width * height; p++) {
    if (seen[p]) continue;
    const x = p % width;
    const touches =
      (x > 0 && seen[p - 1]) || (x < width - 1 && seen[p + 1]) || seen[p - width] || seen[p + width];
    if (!touches) continue;
    const i = p * 4;
    const alpha = 255 - Math.min(out[i], out[i + 1], out[i + 2]);
    out[i + 3] = Math.min(255, alpha * 2);
  }
  return { ...raw, data: out };
}

function recolor(raw, [r, g, b]) {
  const out = Buffer.from(raw.data);
  for (let i = 0; i < out.length; i += 4) {
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
  }
  return { ...raw, data: out };
}

const toSharp = ({ data, width, height }) => sharp(data, { raw: { width, height, channels: 4 } });
const trimmedPng = async (raw) => toSharp(raw).png().toBuffer().then((buf) => sharp(buf).trim().png().toBuffer());

async function buildConcept(concept) {
  const raw = await readRaw(`${SOURCE_DIR}/${concept}.png`);
  const split = findSplitColumn(raw);
  const crop = async (left, width) =>
    readRaw(await sharp(`${SOURCE_DIR}/${concept}.png`).extract({ left, top: 0, width, height: raw.height }).png().toBuffer());

  const markRaw = floodBackground(await crop(0, split));
  const wordRaw = whiteToAlpha(await crop(split, raw.width - split));
  const mark = await trimmedPng(markRaw);
  const word = await trimmedPng(wordRaw);
  const wordDark = await trimmedPng(recolor(wordRaw, DARK_WORDMARK_RGB));

  // Re-assemble the lockup: mark height sets the scale, wordmark at ~46% of it.
  const MARK_HEIGHT = 256;
  const markImg = await sharp(mark).resize({ height: MARK_HEIGHT }).png().toBuffer({ resolveWithObject: true });
  const lockup = async (wordmark) => {
    const wordImg = await sharp(wordmark).resize({ height: Math.round(MARK_HEIGHT * 0.46) }).png().toBuffer({ resolveWithObject: true });
    const gap = Math.round(MARK_HEIGHT * 0.22);
    const width = markImg.info.width + gap + wordImg.info.width;
    return sharp({ create: { width, height: MARK_HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([
        { input: markImg.data, left: 0, top: 0 },
        { input: wordImg.data, left: markImg.info.width + gap, top: Math.round((MARK_HEIGHT - wordImg.info.height) / 2) },
      ])
      .png()
      .toBuffer();
  };

  const dir = `${OUT_DIR}/${concept}`;
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(`${dir}/mark.png`, await sharp(mark).resize({ height: 256, width: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()),
    writeFile(`${dir}/lockup.png`, await lockup(word)),
    writeFile(`${dir}/lockup-dark.png`, await lockup(wordDark)),
  ]);
  console.log(`Built ${dir}`);
  return dir;
}

/** Minimal ICO writer: each entry embeds a PNG. */
function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map(({ data }) => data)]);
}

async function buildIcons(concept) {
  const mark = `${OUT_DIR}/${concept}/mark.png`;
  const transparent = (size, padding = 0) =>
    sharp(mark)
      .resize(size - padding * 2, size - padding * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  // Platforms that mask icons themselves get the mark on solid white with breathing room.
  const opaque = async (size) =>
    sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
      .composite([{ input: await transparent(size, Math.round(size * 0.14)) }])
      .png()
      .toBuffer();

  await mkdir("public/icons", { recursive: true });
  const ico = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await transparent(size) })));
  await Promise.all([
    writeFile("app/favicon.ico", encodeIco(ico)),
    writeFile("app/icon.png", await transparent(192)),
    writeFile("app/apple-icon.png", await opaque(180)),
    writeFile("public/icons/icon-192.png", await opaque(192)),
    writeFile("public/icons/icon-512.png", await opaque(512)),
  ]);
  console.log(`Icons written from ${concept}`);
}

const [target, flag] = process.argv.slice(2);
const concepts = target === "all" ? CONCEPTS : [target];
if (!concepts.every((c) => CONCEPTS.includes(c))) throw new Error(`Use one of: all, ${CONCEPTS.join(", ")}`);
for (const concept of concepts) await buildConcept(concept);
if (flag === "--icons") {
  if (concepts.length !== 1) throw new Error("--icons needs a single concept");
  await buildIcons(concepts[0]);
}
