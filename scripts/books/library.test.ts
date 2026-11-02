import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import type { Book, Library } from "../../app/books/types";

// URL import keeps this test runnable with Node's built-in TypeScript support.
const { matchesBook, firstPurchase, dateLabel, relatedBooks } = await import(new URL("../../app/books/library.ts", import.meta.url).href);
const library: Library = JSON.parse(readFileSync("app/books/data/library.json", "utf8"));

test("only allowlisted public fields leave the Amazon archive", () => {
  const allowed = new Set(["id","title","originalTitles","identifiers","authors","series","seriesOrder","purchases","cover","subjects","sources","workId","readingStatus","publicationYear"]);
  for (const book of library.books) {
    for (const key of Object.keys(book)) assert(allowed.has(key), `Unexpected book field: ${key}`);
    for (const purchase of book.purchases) {
      assert.deepEqual(Object.keys(purchase).sort(), ["date","format","source","status"]);
      assert.match(purchase.date, /^\d{4}-\d{2}-\d{2}$/);
      assert(!Number.isNaN(Date.parse(purchase.date)));
    }
  }
});
test("identifiers are unique and each local cover exists", () => {
  assert.equal(new Set(library.books.map(b => b.id)).size, library.books.length);
  for (const b of library.books) {
    assert(b.title.length && b.purchases.length);
    if (b.cover) { assert(b.cover.startsWith("/assets/books/covers/")); assert(existsSync(`public${b.cover}`)); }
    for (const s of b.sources) {
      const url = new URL(s.url);
      assert.equal(url.protocol, "https:");
      assert(["openlibrary.org", "www.amazon.com", "www.audible.com", "rupaul.com", "harlequin.com", "www.dukeupress.edu", "www.rutgersuniversitypress.org", "us.macmillan.com", "www.penguinrandomhouse.com", "www.penguin.co.uk", "www.panmacmillan.com", "press.uchicago.edu", "alpennia.com", "www.futureverse.earth", "www.theguardian.com", "www.thepinknews.com", "en.wikipedia.org"].includes(url.hostname));
    }
  }
});
test("search matches source titles, author accents, series and multiple terms", () => {
  const book: Book = { ...library.books[0], title: "A different title", authors: ["China Miéville"], originalTitles: ["Original name"], series: "Example Trilogy", subjects: ["Space travel"] };
  assert(matchesBook(book, "mieville space"));
  assert(matchesBook(book, "original"));
  assert(matchesBook(book, "example trilogy"));
  assert(!matchesBook(book, "missing author"));
});
test("dates represent the earliest recorded purchase, independent of array order", () => {
  const book: Book = { ...library.books[0], purchases: [{date:"2020-01-01",format:"Kindle",source:"Amazon",status:"purchased"},{date:"1999-12-31",format:"Paperback",source:"Amazon",status:"purchased"}] };
  assert.equal(firstPurchase(book).date, "1999-12-31");
  assert.equal(dateLabel("1999-12-31"), "31 Dec 1999");
  assert.equal(book.purchases[0].date,"2020-01-01");
});
test("connections distinguish series, author and purchase day without self-links or duplicates", () => {
  const base: Book = { ...library.books[0], id:"a", authors:["Author"],series:"Series",seriesOrder:1,purchases:[{date:"2020-01-01",format:"Kindle",source:"Amazon",status:"purchased"}] };
  const sameSeries = {...base,id:"b",seriesOrder:2};
  const sameAuthor = {...base,id:"c",series:null};
  const sameDay = {...base,id:"d",series:null,authors:["Someone Else"]};
  const unrelated = {...sameDay,id:"e",purchases:[{...base.purchases[0],date:"2021-01-01"}]};
  const result = relatedBooks(base,[base,sameSeries,sameAuthor,sameDay,unrelated]);
  assert.deepEqual(result.series.map((b: Book)=>b.id),["b"]);
  assert.deepEqual(result.authors.map((b: Book)=>b.id),["c"]);
  assert.deepEqual(result.together.map((b: Book)=>b.id),["d"]);
});
test("Dune titles match Luke’s confirmed six-book list with unknown reading dates", () => {
  assert(library.memories.some(memory => memory.id === "dune-originals-memory"));
  assert.equal(library.memories[0].reportedBookCount,6);
  assert.deepEqual(library.memories[0].exactTitles,["Dune","Dune Messiah","Children of Dune","God Emperor of Dune","Heretics of Dune","Chapterhouse: Dune"]);
  for (const book of library.memories[0].books ?? []) { assert.equal(book.readDate,null); assert(book.publicationYear < 1990); if (book.cover) assert(existsSync(`public${book.cover}`)); }
  assert.equal(library.memories[1].reaction,"disliked");
  for(const memory of library.memories) { assert.equal(memory.readDates,null); }
});

const { readBooksLocation, booksLocationUrl, defaultLocation } = await import(new URL("../../app/books/navigation.ts", import.meta.url).href);
test("book locations round-trip every navigation state and special search characters", () => {
  const state = { ...defaultLocation, query: "Dune & Miéville?", year: "2023", sort: "oldest", view: "connections", author: "China Miéville", focusId: "b003j5uika" };
  const url = booksLocationUrl(state);
  assert.deepEqual(readBooksLocation(url.slice(url.indexOf("?"))), state);
  assert.equal(booksLocationUrl(defaultLocation), "/books");
});
test("unknown view and sort URL values fall back safely", () => {
  assert.equal(readBooksLocation("?view=unknown&sort=random").view,"timeline");
  assert.equal(readBooksLocation("?view=unknown&sort=random").sort,"newest");
});

const { bookConnections, selectConnections, connectionReason, bookTopics } = await import(new URL("../../app/books/connections.ts", import.meta.url).href);
test("2001 connects to other science fiction through named catalog subjects", () => {
  const focus = library.books.find(b => b.id === "b01a6e8eq6")!;
  const connections = bookConnections(focus, library.books);
  assert(bookTopics(focus).includes("Space travel"));
  assert(connections.length > 10);
  assert(connections.every((c: {book: Book}) => c.book.id !== focus.id));
  const space = selectConnections(connections,"Space travel");
  assert(space.some((c: {book: Book}) => c.book.title === "Caliban's War"));
  assert(space.every((c: {topics: string[]}) => c.topics.includes("Space travel")));
  assert(connectionReason(space[0],"Space travel").includes("Space travel"));
});
test("Murakami's recovered editions have covers and author connections", () => {
  const focus = library.books.find(b => b.title === "1Q84")!;
  const author = selectConnections(bookConnections(focus,library.books),"author");
  for (const title of ["After Dark","Dance Dance Dance","The Wind-Up Bird Chronicle"]) {
    const found = author.find((c: {book: Book}) => c.book.title === title);
    assert(found?.book.cover, title);
  }
});
test("unrelated books never get a connection merely for sharing a purchase date", () => {
  const first = {...library.books[0], id:"one", authors:[], subjects:[], series:null};
  const second = {...first,id:"two"};
  assert.deepEqual(bookConnections(first,[first,second]),[]);
});
test("characters' occupations do not turn novels into business books", () => {
  const book = {...library.books[0],subjects:["Businessmen", "Businesswomen", "Fiction"]};
  assert(!bookTopics(book).includes("Business & economics"));
});

test("old detail links open connections and author links round-trip exactly", () => {
  const legacy = readBooksLocation("?book=b01a6e8eq6&q=dune&year=2020");
  assert.equal(legacy.view, "connections");
  assert.equal(legacy.focusId, "b01a6e8eq6");
  assert.equal(legacy.query, "");
  assert.equal(legacy.year, "all");
  assert(!booksLocationUrl(legacy).includes("book="));
  const state = {...defaultLocation, author: "China Miéville"};
  assert.deepEqual(readBooksLocation(booksLocationUrl(state).split("?")[1]), state);
});

test("Frequency's reviewed description connects it to space and first-contact fiction", () => {
  const book = library.books.find(b => b.id === "b0h34hf1bq")!;
  assert(bookTopics(book).includes("Science fiction"));
  assert(bookTopics(book).includes("Space travel"));
  assert(bookTopics(book).includes("Alien contact"));
  assert(book.sources.some(source => source.url.includes("audible.com")));
  assert(bookConnections(book, library.books).some((c: {book: Book}) => c.book.id === "b01a6e8eq6"));
});

test("LGBTQ themes span memoir, fiction and culture without treating author identity as a subject", () => {
  const ids = ["b0ccp5rlq1", "b0cw16vtdb", "b0c3ml9c5y"];
  for (const id of ids) {
    const book = library.books.find(b => b.id === id)!;
    assert(bookTopics(book).includes("LGBTQ themes"));
    const related = selectConnections(bookConnections(book, library.books), "LGBTQ themes");
    for (const other of ids.filter(candidate => candidate !== id)) assert(related.some((c: {book: Book}) => c.book.id === other));
  }
  assert(!bookTopics(library.books.find(b => b.id === "b0c3ml9c5y")!).includes("Memoir & biography"));
  for (const id of ids.slice(0, 2)) assert(bookTopics(library.books.find(b => b.id === id)!).includes("Memoir & biography"));
  for (const subject of ["Bisexual characters", "Intersex people", "Same-sex relationships", "Nonbinary characters"]) {
    assert(bookTopics({...library.books[0], subjects:[subject]}).includes("LGBTQ themes"));
  }
  assert(!bookTopics({...library.books[0], authors:["RuPaul"],subjects:[]}).includes("LGBTQ themes"));
  assert.equal(readBooksLocation("?relation=LGBTQ+lives").relation,"LGBTQ themes");
});

test("Tales of the City has ten distinct ordered books with original purchase evidence retained", () => {
  const memory = library.memories.find(m => m.id === "tales-of-the-city-memory")!;
  const purchased = library.books.filter(b => b.series === "Tales of the City");
  const combined = [...purchased, ...(memory.books ?? [])].sort((a,b) => a.seriesOrder! - b.seriesOrder!);
  assert.equal(combined.length,10);
  assert.deepEqual(combined.map(b => b.title),memory.exactTitles);
  assert.deepEqual(combined.map(b => b.seriesOrder),[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(combined.map(b => b.id)).size,10);
  for (const b of combined) {
    assert.deepEqual(b.authors,["Armistead Maupin"]);
    assert(b.cover && existsSync(`public${b.cover}`));
    assert(b.subjects?.includes("Gay fiction"));
  }
  assert.deepEqual(purchased.map(b => [b.seriesOrder,firstPurchase(b)?.date]).sort((a,b) => Number(a[0])-Number(b[0])),[[7,"2014-02-18"],[8,"2014-02-21"],[9,"2014-02-25"]]);
  for (const b of memory.books ?? []) assert.equal(b.readDate,null);
});

test("search finds recommendation titles as well as owned titles", () => {
  const discoveries = JSON.parse(readFileSync("app/books/data/discovery.json", "utf8")).candidates;
  const rightThing = discoveries.find((book: { title: string }) => book.title === "Right Thing, Right Now");
  assert(rightThing, "Regression fixture must exist in recommendations");
  assert(matchesBook(rightThing, "right thing"));
  assert(matchesBook(rightThing, "RYAN holiday"));
  assert(!matchesBook(rightThing, "no such book xyz"));
  assert(!library.books.some(book => matchesBook(book, "right thing")), "This recommendation is not an owned book");
  const dune = library.memories[0].books![0];
  assert(matchesBook(dune, "dune herbert"));
  assert(matchesBook({title:"Another volume",authors:["Test Author"],series:"Example Trilogy"}, "example trilogy"));
});
