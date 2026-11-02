import sharp from "sharp";

/** Enough for high-density 105×160 cards, without upscaling; 70 KiB maximum. */
export async function optimizedCover(bytes: Buffer): Promise<Buffer> {
  const image = sharp(bytes).rotate();
  const meta = await image.metadata();
  const stats = await image.stats();
  if (!meta.width || !meta.height || meta.width < 210 || meta.height < 140 || stats.channels.slice(0,3).every(channel => channel.stdev < 12)) {
    throw new Error("Blank or undersized cover");
  }
  for (const quality of [80,70,60]) {
    const result = await sharp(bytes).rotate().resize({width:432,height:648,fit:"inside",withoutEnlargement:true}).webp({quality,effort:6}).toBuffer();
    if (result.length <= 70 * 1024) return result;
  }
  throw new Error("Cover exceeds the 70 KiB budget; review the source image");
}
