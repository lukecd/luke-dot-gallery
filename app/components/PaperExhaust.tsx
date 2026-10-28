import Image from "next/image";
import styles from "./PaperExhaust.module.css";

/** Maps the source's visible tip and foot to the parent box, without stretching. */
export function PaperExhaust({ sizes }: { sizes: string }) {
  return (
    <div className={styles.paper} aria-hidden="true">
      <Image src="/assets/launch/rocket-exhaust-paper-v1.webp" alt="" fill sizes={sizes} />
    </div>
  );
}
