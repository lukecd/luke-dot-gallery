import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";
const origin = "https://luke.gallery";
const paths = ["/", "/books", "/books?year=1997", "/books?view=connections&focus=b0dptpnlyl", "/books?view=next", "/robots.txt", "/sitemap.xml", "/seo-check-does-not-exist"];
const responses = await Promise.all(paths.map(async path => {
  const response = await fetch(`${base}${path}`);
  return { path, status: response.status, html: await response.text() };
}));
const page = (path: string) => responses.find(response => response.path === path)!;
const content = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

for (const { path, status, html } of responses.filter(response => response.path === "/" || response.path.startsWith("/books"))) {
  assert.equal(status, 200, path);
  assert.match(html, /<title>[^<]*Luke Cassady-Dorion/, `Full-name title: ${path}`);
  const canonical = path === "/" ? `${origin}/` : `${origin}/books`;
  const actualCanonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(new URL(actualCanonical ?? base).href, canonical, `Canonical: ${path}`);
  assert.doesNotMatch(html, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i, `Indexable: ${path}`);
  assert.match(html, /property="og:image"/, `Share image: ${path}`);
  assert.match(html, /name="twitter:card" content="summary_large_image"/, `Social card: ${path}`);
  assert.match(content(html), /<h1[\s>]/, `Server-rendered heading: ${path}`);
  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.ok(schema.some(data => data["@graph"]?.some((entity: Record<string, unknown>) => entity["@type"] === "Person")), `Person schema: ${path}`);
  if (path.startsWith("/books")) assert.ok(schema.some(data => data["@type"] === "CollectionPage"), `Collection schema: ${path}`);
}

const home = content(page("/").html);
for (const heading of ["Sow", "Relaxation Station", "Lazy Designer", "Grok DAS in five minutes.", "DFlow Docs", "Travel Back to the Now", "The Cheer Ambassadors", "Lamont Design"]) {
  assert.ok(home.includes(`<h2>${heading}</h2>`), `Project in initial HTML: ${heading}`);
}
assert.match(home, /href="\/#sow"/, "Real project link");
assert.match(home, /href="https:\/\/pond.dflow.net\//, "Project destination in initial HTML");
assert.doesNotMatch(home, /<iframe/, "Videos load only near their scenes");
assert.doesNotMatch(home, /rocket-exhaust-paper-v1/, "Exhaust waits for launch");

const year = content(page("/books?year=1997").html);
assert.match(year, /My first Amazon order/);
assert.match(year, /The Millennial Project/);
assert.match(year, /Atlas Shrugged/);
assert.doesNotMatch(year, /Frequency: Hard Science Fiction/, "Server honors year filter");
assert.match(year, /href="\/books\?view=connections&amp;focus=0316771635"/, "Crawlable book link");
const salt = content(page("/books?view=connections&focus=b0dptpnlyl").html);
assert.match(salt, /<h2>Saltcrop<\/h2>/);
assert.match(salt, /LGBTQ themes/);
assert.doesNotMatch(salt, /Opening the collection/);
assert.match(content(page("/books?view=next").html), /Where to next\?/);

assert.equal(page("/robots.txt").status, 200);
assert.match(page("/robots.txt").html, /Allow: \/\n/);
assert.match(page("/robots.txt").html, /Disallow: \/api\//);
assert.match(page("/robots.txt").html, /Sitemap: https:\/\/luke.gallery\/sitemap.xml/);
assert.equal(page("/sitemap.xml").status, 200);
const urls = [...page("/sitemap.xml").html.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(urls, [`${origin}/`, `${origin}/books`]);
assert.equal(page("/seo-check-does-not-exist").status, 404);

console.log(`SEO checks passed for ${base}: initial content, direct links, canonicals, indexing, metadata, schema, sitemap, robots, and 404.`);
