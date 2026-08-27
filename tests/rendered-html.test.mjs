import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("server-renders the portfolio and its primary work", async () => {
  const html = await render();
  assert.match(html, /<title>Luke Cassady-Dorion \| Apps, tools, technical explanations, and films<\/title>/i);
  assert.match(html, /I build apps, tools, technical explanations, and films/);
  assert.match(html, /rel="canonical" href="https:\/\/luke\.gallery"/i);
  assert.match(html, /application\/ld\+json/);
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
