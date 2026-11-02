import type { Metadata } from "next";
import { BooksExperience } from "./components/BooksExperience";

export const metadata: Metadata = {
  title: "Books — Luke Cassady-Dorion",
  description: "What I've read, and what connects it. A personal collection reconstructed from purchases and memory.",
  robots: { index: false, follow: false },
  openGraph: { title: "Luke's books", description: "A personal collection reconstructed from purchases and memory.", url: "https://luke.gallery/books", images: [] },
  twitter: { card: "summary", title: "Luke's books", images: [] },
};

export default function BooksPage() { return <BooksExperience />; }
