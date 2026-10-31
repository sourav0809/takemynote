// Builds every logo/favicon asset from the generated logo PNG.
// Usage: node scripts/build-icons.mjs [source=.generated/logo.png]

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = process.argv[2] ?? ".generated/logo.png";
/** The app's primary blue (oklch(0.5 0.134 242.749)); the generated tile is recoloured to it. */
const TILE_COLOR = { r: 0, g: 105, b: 168 };
const TILE_HEX = "#0069a8";
/** Plum of the generated tile; pixels are shifted from it towards TILE_COLOR. */
const SOURCE_TILE_COLOR = { r: 36, g: 27, b: 47 };
const CORNER_RATIO = 0.225;
const MASTER_SIZE = 1024;

function roundedMask(size) {
  const r = Math.round(size * CORNER_RATIO);
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${r}" ry="${r}"/></svg>`
  );
}

/**
 * Shifts the dark generated tile to TILE_COLOR. Each pixel moves by
 * (blue − plum) scaled by its darkness, so anti-aliased edges and the tile's
 * soft gradient survive while the white page and the bright highlighter
 * stroke (almost no darkness) stay unchanged.
 */
async function recolorTile(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const brightest = Math.max(data[i], data[i + 1], data[i + 2]);
    const sourceMax = Math.max(SOURCE_TILE_COLOR.r, SOURCE_TILE_COLOR.g, SOURCE_TILE_COLOR.b);
    const darkness = Math.min(1, Math.max(0, (255 - brightest) / (255 - sourceMax)));
    const shift = (value, from, to) =>
      Math.min(255, Math.max(0, Math.round(value + (to - from) * darkness)));
    data[i] = shift(data[i], SOURCE_TILE_COLOR.r, TILE_COLOR.r);
    data[i + 1] = shift(data[i + 1], SOURCE_TILE_COLOR.g, TILE_COLOR.g);
    data[i + 2] = shift(data[i + 2], SOURCE_TILE_COLOR.b, TILE_COLOR.b);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** Minimal ICO writer: each entry embeds a PNG, supported by every modern browser. */
function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map(({ data }) => data)]);
}

async function main() {
  // Trim the white canvas down to the tile, then cut its corners transparent.
  const tile = await sharp(SOURCE)
    .trim({ background: "#ffffff", threshold: 24 })
    .resize(MASTER_SIZE, MASTER_SIZE, { fit: "fill" })
    .png()
    .toBuffer();
  const master = await sharp(await recolorTile(tile))
    .composite([{ input: roundedMask(MASTER_SIZE), blend: "dest-in" }])
    .png()
    .toBuffer();

  // Opaque, full-bleed version for platforms that apply their own mask.
  const opaque = await sharp({
    create: { width: MASTER_SIZE, height: MASTER_SIZE, channels: 4, background: TILE_HEX },
  })
    .composite([{ input: master }])
    .png()
    .toBuffer();

  const resize = (input, size) => sharp(input).resize(size, size).png().toBuffer();

  await mkdir("components/brand/assets", { recursive: true });
  await mkdir("public/icons", { recursive: true });

  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await resize(master, size) }))
  );

  await Promise.all([
    writeFile("components/brand/assets/logo-mark.png", await resize(master, 256)),
    writeFile("app/icon.png", await resize(master, 192)),
    writeFile("app/apple-icon.png", await resize(opaque, 180)),
    writeFile("app/favicon.ico", encodeIco(icoPngs)),
    writeFile("public/icons/icon-192.png", await resize(opaque, 192)),
    writeFile("public/icons/icon-512.png", await resize(opaque, 512)),
  ]);
  console.log("Icons written.");
}

await main();
