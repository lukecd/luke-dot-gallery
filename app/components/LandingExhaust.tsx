import { PaperExhaust } from "./PaperExhaust";
import styles from "./LandingExhaust.module.css";

export function LandingExhaust() {
  return (
    <div className={styles.exhaust} aria-hidden="true">
      <PaperExhaust sizes="(max-width: 600px) 12vw, 7vw" />
    </div>
  );
}
