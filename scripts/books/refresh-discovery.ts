/** Refresh after adding a book: npm run books:discover -- --author "Author name" */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import type { Library } from "../../app/books/types";
import type { DiscoverySnapshot } from "../../app/books/discovery";
const { collectionBooks } = await import(new URL("../../app/books/library.ts",import.meta.url).href);
const { refreshDiscovery, discoveryChoices } = await import(new URL("../../app/books/discovery.ts",import.meta.url).href);
const args = process.argv.slice(2);
const value = (key:string) => args.includes(key) ? args[args.indexOf(key)+1] : undefined;
const limit = Number(value("--limit") ?? 30);
if (!Number.isInteger(limit) || limit < 1 || limit > 300) throw new Error("--limit must be 1–300");
const books = collectionBooks(JSON.parse(readFileSync("app/books/data/library.json","utf8")) as Library);
const snapshotPath = "app/books/data/discovery.json";
let previous: DiscoverySnapshot = JSON.parse(readFileSync(snapshotPath,"utf8"));
try { previous = JSON.parse(readFileSync(".cache/books/discovery.json","utf8")); } catch { /* First local refresh. */ }
const snapshot: DiscoverySnapshot = await refreshDiscovery(books,previous,{limit,author:value("--author"),onProgress:(author:string,ok:boolean)=>console.log(`${ok ? "Checked" : "Retained previous results"}: ${author}`)});
snapshot.candidates = discoveryChoices(snapshot,[],books);
writeFileSync(snapshotPath,JSON.stringify(snapshot,null,2)+"\n");
mkdirSync(".cache/books",{recursive:true});
writeFileSync(".cache/books/discovery.json",JSON.stringify(snapshot,null,2)+"\n");
console.log(`${snapshot.candidates.length} discoveries; ${Object.values(snapshot.checks).filter(c=>c.checkedAt).length} authors checked.`);
