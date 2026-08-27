import Link from "next/link";
import type { Metadata } from "next";
import AssemblyViewer from "@/app/components/AssemblyViewer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AssemblyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Three.js orbital motion prototype</p>
          <h1 className={styles.title}>Living Machine, assembled.</h1>
        </div>
        <div className={styles.headerMeta}>
          <p>
            Assembly-only orbital motion. Transformation morphing and scroll integration remain intentionally untouched.
          </p>
          <Link href="/studies/portal">Inspect isolated components</Link>
        </div>
      </header>

      <AssemblyViewer />
    </main>
  );
}
