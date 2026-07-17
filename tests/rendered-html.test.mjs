import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the portfolio and its primary work", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Luke Cassady-Dorion \| Developer, designer, maker<\/title>/i);
  assert.match(html, /I make things for people/);
  assert.match(html, /with computers/);
  assert.match(html, /A garden journal that listens/);
  assert.match(html, /Helping developers/);
  assert.match(html, /DFlow/);
  assert.match(html, /Travel Back to the Now/);
  assert.doesNotMatch(html, /coming soon|more will grow here|LinkedIn/i);
});

test("keeps the living world, projects, and assets wired together", async () => {
  const [page, world, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ScrollWorld.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  for (const scene of ["hero", "work", "garden", "devrel", "docs", "creative", "contact"]) {
    assert.match(page, new RegExp(`data-scene=["']${scene}["']`));
  }

  assert.match(world, /shapeForScene/);
  assert.match(world, /SignalCore/);
  assert.match(world, /Tomato/);
  assert.match(world, /SeedBud/);
  assert.match(world, /TechCube/);
  assert.match(world, /PageStack/);
  assert.match(world, /OrganicBlob/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /hero-machine-plate/);

  await Promise.all([
    access(new URL("../public/images/living-machine-plate.webp", import.meta.url)),
    access(new URL("../public/images/botanical/nasturtium-leaf.webp", import.meta.url)),
    access(new URL("../public/images/sow/plants-and-walks.webp", import.meta.url)),
    access(new URL("../public/images/dflow-docs.webp", import.meta.url)),
  ]);
});
