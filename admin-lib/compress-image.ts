const MAX_BYTES = 500_000;
const MAX_DIMENSION = 1600;

/**
 * Shrink a reference photo to roughly 500 KB for plant illustration requests.
 * Runs in the browser before upload.
 */
export async function compressImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.88;
  let blob = await canvasToJpeg(canvas, quality);

  while (blob.size > MAX_BYTES && quality > 0.35) {
    quality -= 0.08;
    blob = await canvasToJpeg(canvas, quality);
  }

  if (blob.size > MAX_BYTES) {
    throw new Error("Image is still too large. Try a smaller photo.");
  }

  return blob;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed."))),
      "image/jpeg",
      quality,
    );
  });
}
