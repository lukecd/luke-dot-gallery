import Image from "next/image";
import Link from "next/link";
import styles from "./LibraryInvitation.module.css";

export function LibraryInvitation() {
  return <aside className={styles.invitation} aria-label="Explore my library">
    <Link href="/books" className={styles.link}>
      <span className={styles.covers} aria-hidden="true">
        {["5536140.jpg","amazon-b0ccp5rlq1.jpg","42408.jpg"].map(file => <Image key={file} src={`/assets/books/covers/${file}`} width={48} height={72} alt="" />)}
      </span>
      <span><strong>What I read.</strong><span>Another way to get to know me.</span><span className={styles.action}>Visit the library →</span></span>
    </Link>
  </aside>;
}
