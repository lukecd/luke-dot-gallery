import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Book } from "../../app/books/types";
import type { DiscoveryBook, DiscoverySnapshot, CatalogWork } from "../../app/books/discovery";
const { catalogCandidate, discoveryChoices, discoveryConnectionBook, refreshDiscovery } = await import(new URL("../../app/books/discovery.ts",import.meta.url).href);
const { readBooksLocation,booksLocationUrl,defaultLocation } = await import(new URL("../../app/books/navigation.ts",import.meta.url).href);
const base = JSON.parse(readFileSync("app/books/data/library.json","utf8")).books[0] as Book;
const owned:Book = {...base,title:"Known Book",originalTitles:[],authors:["Test Author"],identifiers:["123"],workId:"/works/OL1W"};
const work:CatalogWork = {key:"/works/OL2W",title:"Another Book",author_key:["OL1A"],author_name:["Test Author"],language:["eng"],first_publish_year:2020};
const candidate:DiscoveryBook = {id:work.key,title:work.title,authors:["Test Author"],publicationYear:2020,cover:null,sourceUrl:"https://openlibrary.org/works/OL2W"};
const snapshot:DiscoverySnapshot = {updatedAt:"2025-01-01T00:00:00.000Z",checks:{"Test Author":{authorKey:"OL1A",attemptedAt:"2025-01-01",checkedAt:"2025-01-01"}},candidates:[candidate]};
test("discovery excludes owned works, ISBNs, editions, future books and unrelated authors",()=>{
 assert(catalogCandidate(work,"Test Author","OL1A",[owned],2026));
 for(const patch of [{key:owned.workId},{isbn:["123"]},{title:"Known Book: A new edition"},{first_publish_year:2027},{language:["fra"]},{author_name:["Namesake"]},{title:"Books 1–3 Boxed Set"},{title:"Reading Group Guide"},{title:"Tales of the City Episode 1"}]) assert.equal(catalogCandidate({...work,...patch},"Test Author","OL1A",[owned],2026),undefined);
});
test("reviewed series information wins over catalog duplicates and new purchases disappear",()=>{
 const reviewed={...candidate,series:"Example",seriesOrder:2};
 assert.deepEqual(discoveryChoices(snapshot,[reviewed],[owned]),[reviewed]);
 assert.deepEqual(discoveryChoices(snapshot,[reviewed],[owned,{...owned,title:candidate.title,workId:candidate.id}]),[]);
});
test("downloaded covers survive coverless catalog refreshes and preserve reviewed editions",()=>{
 const covers = {[candidate.id]:"/assets/books/discovery/test.jpg"};
 assert.equal(discoveryChoices(snapshot,[],[owned],covers)[0].cover,covers[candidate.id]);
 const reviewed={...candidate,cover:"/assets/books/discovery/reviewed.jpg"};
 assert.equal(discoveryChoices(snapshot,[reviewed],[owned],covers)[0].cover,reviewed.cover);
 assert.equal(snapshot.candidates[0].cover,null);
});
test("reviewed exclusions prevent catalog refreshes from restoring namesakes and duplicate editions",()=>{
 const excluded = JSON.parse(readFileSync("app/books/data/discovery-excluded.json","utf8"));
 const candidates = Object.keys(excluded).map(id=>({...candidate,id}));
 assert.deepEqual(discoveryChoices({...snapshot,candidates},[],[owned]),[]);
});
test("upstream failure retains good discoveries and last successful check",async()=>{
 const next=await refreshDiscovery([owned],snapshot,{pauseMs:0,fetcher:async()=>{throw new Error("offline");},now:new Date("2026-01-01")});
 assert.deepEqual(next.candidates,snapshot.candidates);assert.equal(next.updatedAt,snapshot.updatedAt);assert.equal(next.checks["Test Author"].checkedAt,"2025-01-01");assert.notEqual(next.checks["Test Author"].attemptedAt,"2025-01-01");assert.equal(snapshot.checks["Test Author"].attemptedAt,"2025-01-01");
});
test("successful refresh replaces an author's candidates while excluding collected books",async()=>{
 const next=await refreshDiscovery([owned],snapshot,{pauseMs:0,fetcher:async()=>Response.json({docs:[{...work,title:"New Discovery",key:"/works/OL3W"},{...work,key:owned.workId,title:owned.title}]}),now:new Date("2026-01-01")});
 assert.deepEqual(next.candidates.map((b:DiscoveryBook)=>b.title),["New Discovery"]);assert.equal(next.updatedAt,"2026-01-01T00:00:00.000Z");
});
test("author namesakes without any known bibliography are rejected",async()=>{
 const next=await refreshDiscovery([owned],{updatedAt:null,checks:{},candidates:[]},{pauseMs:0,fetcher:async(url:RequestInfo|URL)=>String(url).includes("authors.json")?Response.json({docs:[{key:"OL1A",name:"Test Author"}]}):Response.json({docs:[work]})});
 assert.equal(next.candidates.length,0);assert.equal(next.checks["Test Author"].checkedAt,null);
});
test("discovery view and filter survive browser URL round trips",()=>{
 const state={...defaultLocation,view:"next",discoveryFilter:"series"};assert.deepEqual(readBooksLocation(booksLocationUrl(state).split("?")[1]),state);for (const filter of ["invalid","saved","hidden"]) assert.equal(readBooksLocation(`?view=next&discover=${filter}`).discoveryFilter,"all");
});

test("recommendation connections retain series, normalize author names, and never imply a purchase", async () => {
 const { bookConnections } = await import(new URL("../../app/books/connections.ts", import.meta.url).href);
 const collection = [{...owned, authors:["J. R. R. Tolkien"], series:"Middle-earth", seriesOrder:1}];
 const next = discoveryConnectionBook({...candidate, authors:["J.R.R. Tolkien"], series:"Middle-earth", seriesOrder:2}, collection);
 assert.equal(next.title, candidate.title);
 assert.deepEqual(next.authors, collection[0].authors);
 assert.deepEqual(next.purchases, []);
 assert.equal(next.readingStatus, "not-read");
 const connections = bookConnections(next, collection);
 assert.equal(connections.length, 1);
 assert.equal(connections[0].sameAuthor, true);
 assert.equal(connections[0].sameSeries, true);
 const state = {...defaultLocation, view:"connections", focusId:next.id};
 assert.deepEqual(readBooksLocation(booksLocationUrl(state).split("?")[1]), state);
 assert.equal(collection.length, 1);
});
