import { dateLabel, firstPurchase } from "../library";
import type { Book } from "../types";
import styles from "../books.module.css";

export function PurchaseDate({ book, className = styles.purchaseDate }: { book: Book; className?: string }) {
  const purchase = firstPurchase(book);
  return <p className={className}><span>{purchase?.status === "preorder" ? "Preorder date" : "Purchase date"}: </span>{purchase ? <time dateTime={purchase.date}>{dateLabel(purchase.date)}</time> : "unknown"}</p>;
}
