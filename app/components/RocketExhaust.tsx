import { PaperExhaust } from "./PaperExhaust";
import styles from "./RocketExhaust.module.css";

export function RocketExhaust() {
  return (
    <div className={styles.exhaust} aria-hidden="true">
      <PaperExhaust sizes="90vh" />
    </div>
  );
}
