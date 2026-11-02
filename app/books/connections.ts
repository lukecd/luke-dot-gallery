import type { Book } from "./types";

// Normalize catalog terminology into a small, readable set of subjects. These
// are catalog-based connections, not claims that two stories have the same plot.
const topicRules: [string, RegExp][] = [
  ["Science fiction", /science fiction|science-fiction|hard sf|space opera/i],
  ["Fantasy", /fantasy|fantastique/i],
  ["Magical realism", /magic(al)? realism/i],
  ["Mystery & suspense", /mystery|detective|thriller|suspense/i],
  ["Historical fiction", /historical fiction/i],
  ["Space travel", /space travel|space exploration|space flight|spaceflight|space ships|spaceships|space vehicles|interplanetary|interstellar/i],
  ["Alien contact", /extraterrestrial|alien (contact|civilization|encounters|invasion|artifacts)|human-alien|life on other planets/i],
  ["Artificial intelligence", /artificial intelligence|human-computer|robots|robotics|androids/i],
  ["Time & alternate worlds", /time travel|parallel (worlds|universes)|alternate (worlds|universes|realities|history)|alternative histor/i],
  ["Dystopia", /dystopi|totalitarian/i],
  ["Survival & catastrophe", /apocalyp|end of the world|survival/i],
  ["Ecology & environment", /ecolog|environment|climate|global warming/i],
  ["Identity & belonging", /identity|alienation|belonging|self-realization/i],
  ["Japan", /japan|tokyo|japanese/i],
  ["LGBTQ themes", /\b(gays?|lesbians?|transgender|transsexual\w*|homosexual\w*|bisexual\w*|intersex|non[ -]?binary|genderqueer|lgbt\w*|queer|sapphic)\b|same[ -]sex|sexual minorities|gender minorities/i],
  ["Memoir & biography", /biograph|memoir|personal narratives/i],
  ["Filmmaking", /motion pictures|cinematograph|screenwriting|film (direct|edit|produc|mak)|movie/i],
  ["Music", /music|piano|songwrit|composers/i],
  ["Technology", /computer|software|programming|blockchain|cryptocurrenc|ethereum|bitcoin/i],
  ["Business & economics", /\bbusiness\b|entrepreneurship|\beconomics\b|\bfinance\b|\bmarketing\b/i],
  ["Mindfulness & spirituality", /mindfulness|meditation|yoga|buddhis|spiritual/i],
  ["Language", /linguistic|language learning|language and languages|foreign language/i],
  ["Food & cooking", /cookery|cooking|food writing|recipes/i],
  ["Science & nature", /biology|botany|physics|natural history|neuroscience/i],
];
export function bookTopics(book: Book): string[] {
  return topicRules.filter(([, pattern]) => book.subjects.some(subject => pattern.test(subject))).map(([label]) => label);
}
export type BookConnection = { book: Book; sameSeries: boolean; sameAuthor: boolean; sameWorld: boolean; topics: string[]; score: number };
export function bookConnections(focus: Book, books: Book[]): BookConnection[] {
  const topics = bookTopics(focus);
  const indexed = books.map(book => ({ book, topics: bookTopics(book) }));
  const frequency = new Map(topics.map(topic => [topic, indexed.filter(entry => entry.topics.includes(topic)).length]));
  return indexed.filter(({book}) => book.id !== focus.id).map(({book, topics: other}) => {
    const shared = topics.filter(topic => other.includes(topic)).sort((a,b) => frequency.get(a)! - frequency.get(b)!);
    const sameSeries = !!focus.series && focus.series === book.series;
    const duneSeries = ["Dune", "Legends of Dune"];
    const sameWorld = !sameSeries && duneSeries.includes(focus.series ?? "") && duneSeries.includes(book.series ?? "");
    const sameAuthor = focus.authors.some(author => book.authors.includes(author));
    const score = (sameSeries ? 100 : sameWorld ? 80 : sameAuthor ? 70 : 0) + shared.reduce((sum, topic) => sum + 10 + 50 / frequency.get(topic)!, 0);
    return { book, sameSeries, sameAuthor, sameWorld, topics: shared, score };
  }).filter(connection => connection.score > 0).sort((a,b) => b.score - a.score || (a.book.seriesOrder ?? 999) - (b.book.seriesOrder ?? 999) || a.book.title.localeCompare(b.book.title));
}
export function selectConnections(connections: BookConnection[], relation: string): BookConnection[] {
  if (relation === "series") return connections.filter(c => c.sameSeries).sort((a,b) => (a.book.seriesOrder ?? 999) - (b.book.seriesOrder ?? 999));
  if (relation === "world") return connections.filter(c => c.sameWorld);
  if (relation === "author") return connections.filter(c => c.sameAuthor);
  if (relation !== "all") return connections.filter(c => c.topics.includes(relation));
  // Keep the overview varied: two close author/series links, then other authors.
  const close = connections.filter(c => c.sameSeries || c.sameAuthor).slice(0,2);
  const outside = connections.filter(c => !c.sameAuthor && !c.sameSeries);
  return [...close, ...outside, ...connections.filter(c => !close.includes(c) && !outside.includes(c))];
}
export function connectionReason(connection: BookConnection, relation = "all") {
  if (relation === "series" || (relation === "all" && connection.sameSeries)) return `Same series · ${connection.book.series}`;
  if (relation === "world" || (relation === "all" && connection.sameWorld)) return `Dune universe · ${connection.book.series === "Legends of Dune" ? "Prequels" : "Original novels"}`;
  if (relation === "author" || (relation === "all" && connection.sameAuthor)) return "Same author";
  const topics = relation === "all" ? connection.topics.slice(0,2) : [relation, ...connection.topics.filter(topic => topic !== relation).slice(0,1)];
  return `Shared subjects · ${topics.join(" + ")}`;
}
