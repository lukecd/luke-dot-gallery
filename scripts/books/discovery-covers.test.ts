import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import sharp from "sharp";

test("discovery covers are local WebP assets within the image budget", async () => {
  const covers: Record<string,string> = JSON.parse(readFileSync("app/books/data/discovery-covers.json","utf8"));
  const reviewed: {cover:string|null}[] = JSON.parse(readFileSync("app/books/data/discovery-reviewed.json","utf8"));
  const paths = new Set([...Object.values(covers), ...reviewed.flatMap(book=>book.cover ? [book.cover] : [])]);
  for (const path of paths) {
    assert.match(path, /^\/assets\/books\/discovery\/[^/]+\.webp$/);
    const file = `public${path}`;
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.format,"webp",path);
    assert(statSync(file).size <= 70 * 1024, `Oversized cover: ${path}`);
    assert(metadata.width! <= 432 && metadata.height! <= 648, `Excessive dimensions: ${path}`);
    assert(metadata.width! >= 100 && metadata.height! >= 140, `Unusable thumbnail: ${path}`);
  }
});
