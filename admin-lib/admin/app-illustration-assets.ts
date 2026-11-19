import sharp from "sharp";

const ARCHIVE_ROOT = "Artwork/Plant Illustration Originals";
const APP_ASSETS_ROOT = "Sow/Resources/Assets.xcassets/Plants";

export type IllustrationAssetPayload = {
  archiveDirectory: string;
  appAssetDirectory: string;
  fileName: string;
  master: Buffer;
  delivery: Buffer;
  contents: string;
};

export function imageSetContents(fileName: string) {
  return JSON.stringify({
    images: [{ filename: fileName, idiom: "universal", scale: "1x" }, { idiom: "universal", scale: "2x" }, { idiom: "universal", scale: "3x" }],
    info: { author: "xcode", version: 1 },
  }, null, 2);
}

async function createDeliveryCopy(master: Buffer) {
  const input = await sharp(master).metadata();
  if (input.format !== "png") throw new Error("Approved plant illustrations must be PNG files.");
  if (!input.width || !input.height || input.width !== input.height) {
    throw new Error("Approved plant illustrations must be square before app handoff.");
  }

  const delivery = await sharp(master)
    .resize(768, 768, { fit: "fill", kernel: "lanczos3" })
    .png({ palette: true, colours: 256, effort: 10 })
    .toBuffer();
  const output = await sharp(delivery).metadata();
  if (output.format !== "png" || output.width !== 768 || output.height !== 768 || !output.isPalette) {
    throw new Error("Could not create the required 768px paletted PNG for the app.");
  }
  if (input.hasAlpha && !output.hasAlpha) {
    throw new Error("The app delivery copy did not preserve the illustration alpha channel.");
  }
  return delivery;
}

export async function buildIllustrationAssetPayload(assetName: string, master: Buffer): Promise<IllustrationAssetPayload> {
  const fileName = `${assetName}.png`;
  return {
    archiveDirectory: `${ARCHIVE_ROOT}/${assetName}.imageset`,
    appAssetDirectory: `${APP_ASSETS_ROOT}/${assetName}.imageset`,
    fileName,
    master,
    delivery: await createDeliveryCopy(master),
    contents: imageSetContents(fileName),
  };
}
