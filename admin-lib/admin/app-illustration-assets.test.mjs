import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import { buildIllustrationAssetPayload } from "./app-illustration-assets.ts";

test("creates an unchanged archival master and a 768px paletted app copy with alpha", async () => {
  const master = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 91, g: 145, b: 71, alpha: 0.5 } } })
    .composite([{ input: await sharp({ create: { width: 240, height: 400, channels: 4, background: { r: 178, g: 91, b: 48, alpha: 1 } } }).png().toBuffer(), top: 300, left: 392 }])
    .png()
    .toBuffer();

  const payload = await buildIllustrationAssetPayload("GerberaJamesonii", master);
  const output = await sharp(payload.delivery).metadata();

  assert.deepEqual(payload.master, master);
  assert.equal(payload.archiveDirectory, "Artwork/Plant Illustration Originals/GerberaJamesonii.imageset");
  assert.equal(payload.appAssetDirectory, "Sow/Resources/Assets.xcassets/Plants/GerberaJamesonii.imageset");
  assert.equal(payload.fileName, "GerberaJamesonii.png");
  assert.equal(output.format, "png");
  assert.equal(output.width, 768);
  assert.equal(output.height, 768);
  assert.equal(output.isPalette, true);
  assert.equal(output.hasAlpha, true);
  assert.deepEqual(JSON.parse(payload.contents), {
    images: [
      { filename: "GerberaJamesonii.png", idiom: "universal", scale: "1x" },
      { idiom: "universal", scale: "2x" },
      { idiom: "universal", scale: "3x" },
    ],
    info: { author: "xcode", version: 1 },
  });
});
