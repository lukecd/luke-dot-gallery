import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StudyWorld from "@/app/components/StudyWorld";
import { STUDIES, isStudySlug } from "@/app/studies/study-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return STUDIES.map(({ slug }) => ({ slug }));
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isStudySlug(slug)) notFound();
  const active = STUDIES.find((study) => study.slug === slug)!;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Static Three.js approval viewer</p>
          <h1 className={styles.title}>Living Machine studies</h1>
        </div>
        <div className={styles.headerMeta}>
          <p className={styles.note}>
            Isolated geometry and materials only. No morphing, ambient motion, or scroll integration.
          </p>
          <Link className={styles.assemblyLink} href="/assembly">View frozen assembly</Link>
        </div>
      </header>

      <section className={styles.workspace}>
        <nav className={styles.nav} aria-label="Living Machine studies">
          {STUDIES.map((study, index) => (
            <Link
              className={study.slug === slug ? styles.active : undefined}
              href={`/studies/${study.slug}`}
              key={study.slug}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{study.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.viewer}>
          <div className={styles.canvas}>
            <StudyWorld slug={slug} />
          </div>
          <div className={styles.caption}>
            <p>{active.kind}</p>
            <h2>{active.label}</h2>
          </div>
        </div>
      </section>
    </main>
  );
}
