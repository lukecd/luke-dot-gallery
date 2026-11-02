/** Read the private ZIP in place. Only the explicit book fields below leave it.
 * node --experimental-strip-types scripts/books/import-amazon.ts /path/to/Your\ Orders.zip
 * Re-run enrichment afterwards. No addresses, payment data, order IDs, or prices are emitted.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Book, Library, Purchase } from "../../app/books/types";

const archive = process.argv[2];
if (!archive) throw new Error("Pass the path to the private Amazon ZIP.");

// CSV state machine supports escaped quotes, commas and multiline fields.
function csv(text: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], field = "", quoted = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ""; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift()!;
  return rows.filter(r => r.length === headers.length).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
function read(name: string) { return csv(execFileSync("unzip", ["-p", archive, `Your Amazon Orders/${name}.csv`], { maxBuffer: 8_000_000 }).toString()); }

// Reviewed paid non-book ASINs: apps, games, aquarium screensavers and document delivery.
// Free entries were separately reviewed: Origin of Species is the sole free book.
const nonBooks = new Set("B01MDLTMBB B07JPK4W3T B00PBHB3WG B0D2VCM8ZZ B00PH4SI9E B0F7Y1579H B0DCGGMSQF B0CCYW7N7Z B0DQDJN87X B013LPTPM4 B074JL9P5D B00M7GW0LC B0C828D9K1 B0BHF4NZSJ B0C3YYL4NM B001UHOW7Y B0F31NXW1K".split(" "));
const returned = new Set(read("Digital Returns").filter(r => r["Return Status"] === "Customer Return Complete").map(r => r["Digital Order Item ID"]));
const digital = read("Digital Content Orders");
const paidAsins = new Set(digital.filter(r => Number(r.Price) > 0).map(r => r.ASIN));
const items = new Map<string, Record<string, string>>();
for (const r of digital) {
  if (nonBooks.has(r.ASIN) || r["Subscription Order Type"] !== "Not Applicable") continue;
  if (r["Digital Order Item Attributes"] !== "Not Applicable" && !r["Digital Order Item Attributes"].startsWith("CustomerLocale")) continue;
  if (!paidAsins.has(r.ASIN) && !r["Product Name"].startsWith("On the Origin of Species")) continue;
  if (!["SUCCESS", "PENDING_PREORDER_RELEASE"].includes(r["Order Status"]) || returned.has(r["Digital Order Item ID"])) continue;
  items.set(r["Digital Order Item ID"], r);
}
const books = new Map<string, Book>();
const exclusions: string[] = JSON.parse(readFileSync("design/books/excluded-books.json", "utf8"));
function add(r: Record<string, string>, format: string) {
  if (exclusions.includes(r.ASIN) || exclusions.includes(r.ASIN.toLowerCase())) return;
  let book = books.get(r.ASIN);
  if (!book) {
    const title = r["Product Name"].replace(/\s+\[[^\]]*\]/g, "").replace(/\s+by\s+.+$/i, "").trim();
    book = { id: r.ASIN.toLowerCase(), title, originalTitles: [r["Product Name"]], identifiers: [r.ASIN], authors: [], series: null, seriesOrder: null, purchases: [], cover: null, subjects: [], sources: [] };
    books.set(r.ASIN, book);
  }
  const purchase: Purchase = { date: r["Order Date"].slice(0, 10), format, source: "Amazon", status: r["Order Status"] === "PENDING_PREORDER_RELEASE" ? "preorder" : "purchased" };
  if (!book.purchases.some(p => p.date === purchase.date && p.format === format && p.status === purchase.status)) book.purchases.push(purchase);
}
for (const r of items.values()) add(r, "Kindle");
const formats: Record<string, string> = { Paperback: "Paperback", "Mass Market Paperback": "Paperback", Hardcover: "Hardcover", "Spiral-bound": "Spiral-bound", Unbound: "Print" };
for (const r of read("Order History")) if (formats[r.Department] && r["Order Status"] === "Closed") add(r, formats[r.Department]);
const memories = JSON.parse(readFileSync("design/books/reading-notes.json", "utf8")).memories.filter((memory: { id: string }) => !exclusions.includes(memory.id));
const library: Library = { updated: "2026-11-01", books: [...books.values()], memories };
mkdirSync("app/books/data", { recursive: true });
writeFileSync("app/books/data/library.json", JSON.stringify(library, null, 2) + "\n");
console.log(`Imported ${library.books.length} distinct Amazon listings, ${library.books.reduce((n,b) => n+b.purchases.length,0)} purchase/preorder entries and ${memories.length} memories. No private order fields exported.`);
