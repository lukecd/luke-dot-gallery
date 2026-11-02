import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { basename } from "node:path";
import type { DiscoveryBook } from "../../app/books/discovery";
const { optimizedCover } = await import(new URL("./cover-image.ts",import.meta.url).href);
const mapPath = "app/books/data/discovery-covers.json";
const reviewedPath = "app/books/data/discovery-reviewed.json";
const covers: Record<string,string> = JSON.parse(readFileSync(mapPath,"utf8"));
const reviewed: DiscoveryBook[] = JSON.parse(readFileSync(reviewedPath,"utf8"));
const paths = [...new Set([...Object.values(covers),...reviewed.map(b=>b.cover).filter((p):p is string=>!!p)])];
mkdirSync(".cache/books/cover-originals",{recursive:true});
const replacements = new Map<string,string>();
let before=0,after=0,max=0;
for (const path of paths) {
  const bytes = readFileSync(`public${path}`);
  const output = path.replace(/\.(jpg|jpeg|png|webp)$/i,".webp");
  const optimized:Buffer = path.endsWith(".webp") ? bytes : await optimizedCover(bytes);
  writeFileSync(`public${output}`,optimized);
  replacements.set(path,output);
  before+=bytes.length;after+=optimized.length;max=Math.max(max,optimized.length);
}
for(const [id,path] of Object.entries(covers)) covers[id]=replacements.get(path)!;
for(const book of reviewed) if(book.cover) book.cover=replacements.get(book.cover)!;
writeFileSync(mapPath,JSON.stringify(covers,null,2)+"\n");
writeFileSync(reviewedPath,JSON.stringify(reviewed,null,2)+"\n");
// Preserve originals outside public so deployments contain only optimized assets.
for(const [original,optimized] of replacements) if(original!==optimized && existsSync(`public${original}`)) {
  renameSync(`public${original}`,`.cache/books/cover-originals/${basename(original)}`);
}
console.log(JSON.stringify({images:paths.length,beforeBytes:before,afterBytes:after,largestBytes:max,savedPercent:Math.round((1-after/before)*100)},null,2));
