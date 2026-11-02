/** Download covers for the discovery snapshot; reruns retain completed downloads. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { DiscoverySnapshot } from "../../app/books/discovery";
const { optimizedCover } = await import(new URL("./cover-image.ts",import.meta.url).href);

const snapshot: DiscoverySnapshot = JSON.parse(readFileSync("app/books/data/discovery.json","utf8"));
const excluded: Record<string, unknown> = JSON.parse(readFileSync("app/books/data/discovery-excluded.json","utf8"));
const mapPath = "app/books/data/discovery-covers.json";
const sourcePath = "design/books/discovery-cover-sources.json";
const cachePath = ".cache/books/discovery-cover-catalog.json";
type CoverRecord = { key: string; title: string; cover_i?: number; cover_edition_key?: string };
const read = (path: string) => existsSync(path) ? JSON.parse(readFileSync(path,"utf8")) : {};
const covers: Record<string,string> = read(mapPath);
const sources: Record<string,{title:string;url:string;imageUrl:string}> = read(sourcePath);
const catalog: Record<string,CoverRecord> = read(cachePath);
mkdirSync(".cache/books",{recursive:true});
mkdirSync("public/assets/books/discovery",{recursive:true});
const pause = () => new Promise(resolve=>setTimeout(resolve,400));
const get = async (url:string) => {
  const response = await fetch(url,{headers:{"User-Agent":"LukeGalleryLibrary/1.0 (https://luke.gallery)"},signal:AbortSignal.timeout(25000)});
  await pause();
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
};
const candidates = snapshot.candidates.filter(b=>!Object.hasOwn(excluded,b.id));
const missing = candidates.filter(b=>!covers[b.id] || !existsSync(`public${covers[b.id]}`));
// Search accepts a Solr OR query, allowing exact work IDs to share one request.
const uncached = missing.filter(b=>!catalog[b.id]);
for(let i=0;i<uncached.length;i+=25) {
  const batch=uncached.slice(i,i+25);
  const q=batch.map(b=>`key:${b.id}`).join(" OR ");
  try {
    const data=await (await get(`https://openlibrary.org/search.json?${new URLSearchParams({q,fields:"key,title,cover_i,cover_edition_key",limit:"100"})}`)).json();
    for(const work of data.docs as CoverRecord[]) catalog[work.key.startsWith("/works/")?work.key:`/works/${work.key}`]=work;
    writeFileSync(cachePath,JSON.stringify(catalog,null,2)+"\n");
    console.log(`Catalog ${Math.min(i+25,uncached.length)}/${uncached.length}: ${data.docs.length} records`);
  } catch(error) { console.log(String(error)); }
}
async function download(book: DiscoverySnapshot["candidates"][number]) {
  const record=catalog[book.id];
  if(!record?.cover_i) { console.log(`Missing cover ID: ${book.title}`);return; }
  const url=`https://covers.openlibrary.org/b/id/${record.cover_i}-L.jpg?default=false`;
  try {
    const response=await get(url);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(!response.headers.get("content-type")?.startsWith("image/") || bytes.length<2500) throw new Error("Blank or invalid cover");
    const path=`/assets/books/discovery/${book.id.split("/").pop()}.webp`;
    const optimized:Buffer=await optimizedCover(bytes);
    writeFileSync(`public${path}`,optimized);
    covers[book.id]=path;
    sources[book.id]={title:book.title,url:book.sourceUrl,imageUrl:url};
    writeFileSync(mapPath,JSON.stringify(covers,null,2)+"\n");
    writeFileSync(sourcePath,JSON.stringify(sources,null,2)+"\n");
    console.log(`Downloaded: ${book.title}`);
  } catch(error) {console.log(`Unresolved: ${book.title}: ${String(error)}`);}
}
const queue = [...missing];
await Promise.all(Array.from({length:3},async()=>{
  while(queue.length) await download(queue.shift()!);
}));
console.log(JSON.stringify({covered:candidates.filter(b=>covers[b.id]).length,missing:candidates.filter(b=>!covers[b.id]).map(b=>({id:b.id,title:b.title,authors:b.authors}))},null,2));
