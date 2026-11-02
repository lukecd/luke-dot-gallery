import data from "./data/library.json";
import { collectionBooks } from "./library";
import type { Library } from "./types";
export const books = collectionBooks(data as Library);
