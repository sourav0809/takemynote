// Builds every logo/favicon asset from the generated logo PNG.
// Usage: node scripts/build-icons.mjs [source=.generated/logo.png]

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = process.argv[2] ?? ".generated/logo.png";
const TILE_COLOR = "#241b2f";
const CORNER_RATIO = 0.225;
const MASTER_SIZE = 1024;

function roundedMask(size) {
  const r = Math.round(size * CORNER_RATIO);
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${r}" ry="${r}"/></svg>`
  );
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
  const master = await sharp(tile)
    .composite([{ input: roundedMask(MASTER_SIZE), blend: "dest-in" }])
    .png()
    .toBuffer();

  // Opaque, full-bleed version for platforms that apply their own mask.
  const opaque = await sharp({
    create: { width: MASTER_SIZE, height: MASTER_SIZE, channels: 4, background: TILE_COLOR },
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
