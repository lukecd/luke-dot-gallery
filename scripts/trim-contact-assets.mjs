import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Generated source artwork belongs outside `public`; only the trimmed runtime
// layers should be deployed. This script is the bridge between the two.
const contactSourceDirectory = path.resolve("assets-source/contact");
const contactPublicDirectory = path.resolve("public/assets/contact");
const transparentMargin = 4;
const landingPadSplitRow = 250;
const assets = [
  ["contact-aurora-v2.png", "contact-aurora-trimmed-v2.png"],
  ["contact-moon-v1.png", "contact-moon-trimmed-v1.png"],
  ["contact-plain-v2.png", "contact-plain-trimmed-v2.png"],
];

async function trimAsset(sourceName, outputName) {
  const sourcePath = path.join(contactSourceDirectory, sourceName);
  const outputPath = path.join(contactPublicDirectory, outputName);
  const image = sharp(sourcePath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) throw new Error(`${sourceName} has no visible pixels.`);

  const left = Math.max(0, minX - transparentMargin);
  const top = Math.max(0, minY - transparentMargin);
  const right = Math.min(info.width - 1, maxX + transparentMargin);
  const bottom = Math.min(info.height - 1, maxY + transparentMargin);

  await sharp(sourcePath)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toFile(outputPath);

  console.log(`${sourceName} -> ${outputName}: ${right - left + 1}x${bottom - top + 1}`);
}

async function splitLandingPad() {
  const sourcePath = path.join(contactSourceDirectory, "contact-landing-pad-trimmed-v3.png");
  const source = sharp(sourcePath).ensureAlpha();
  const { width, height } = await source.metadata();

  if (!width || !height || landingPadSplitRow <= 0 || landingPadSplitRow >= height) {
    throw new Error(`Invalid landing-pad split row ${landingPadSplitRow} for ${width}x${height}.`);
  }

  await Promise.all([
    sharp(sourcePath)
      .extract({ left: 0, top: 0, width, height: landingPadSplitRow })
      .extend({ top: 0, bottom: height - landingPadSplitRow, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(contactPublicDirectory, "contact-landing-pad-rear-v1.png")),
    sharp(sourcePath)
      .extract({ left: 0, top: landingPadSplitRow, width, height: height - landingPadSplitRow })
      .extend({ top: landingPadSplitRow, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(contactPublicDirectory, "contact-landing-pad-front-v1.png")),
  ]);

  console.log(`contact-landing-pad-trimmed-v3.png -> rear/front at row ${landingPadSplitRow} on shared ${width}x${height} canvas`);
}

await Promise.all([fs.access(contactSourceDirectory), fs.access(contactPublicDirectory)]);
await Promise.all(assets.map(([source, output]) => trimAsset(source, output)));
await splitLandingPad();
