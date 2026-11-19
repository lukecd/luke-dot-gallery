import {
  analyticsEnvironments,
  analyticsRanges,
  type AnalyticsSnapshot,
} from "@/admin-lib/admin/analytics";
import type { CSSProperties } from "react";

import styles from "@/admin-components/AnalyticsDashboard.module.css";

function rangeHref(range: number, environment: string) {
  return `/admin/analytics?range=${range}&environment=${environment}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function relativeTimestamp(value: string | null) {
  if (!value) return "Not updated yet";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Update time unavailable";
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 2) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `Updated ${hours} hr ago`;
  return `Updated ${Math.round(hours / 24)} days ago`;
}

function successRate(snapshot: AnalyticsSnapshot) {
  const outcomes = snapshot.totals.walksSaved + snapshot.totals.walksFailed;
  return outcomes ? Math.round((snapshot.totals.walksSaved / outcomes) * 100) : null;
}

function Chart({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const highest = Math.max(...snapshot.daily.map((day) => day.walksSaved), 1);
  const labelEvery = Math.max(1, Math.ceil(snapshot.daily.length / 6));
  const hasActivity = snapshot.daily.some((day) => day.walksSaved > 0);
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${snapshot.daily.length}, minmax(0, 1fr))`,
  };

  if (!hasActivity) {
    return <p className={styles.emptyChart}>No saved walks in this period.</p>;
  }

  return <div className={styles.chart} aria-label="Saved Garden Walks by day">
    <div className={styles.chartBars} style={gridStyle}>
      {snapshot.daily.map((day) => {
        const height = day.walksSaved ? Math.max(8, (day.walksSaved / highest) * 100) : 0;
        return (
          <span className={styles.chartColumn} key={day.date} title={`${formatDate(day.date)}: ${day.walksSaved} saved walks`}>
            {day.walksSaved > 0 && <i style={{ height: `${height}%` }} />}
          </span>
        );
      })}
    </div>
    <div className={styles.chartDates} aria-hidden="true" style={gridStyle}>
      {snapshot.daily.map((day, index) => (
        <span key={day.date}>{index % labelEvery === 0 || index === snapshot.daily.length - 1 ? formatDate(day.date) : ""}</span>
      ))}
    </div>
  </div>;
}

export function AnalyticsDashboard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const isReady = snapshot.state === "ready";
  const rate = successRate(snapshot);
  const averageDuration = snapshot.totals.walksSaved
    ? snapshot.totals.completedDurationSeconds / snapshot.totals.walksSaved
    : 0;

  const metrics = [
    ["New accounts", snapshot.totals.newGardeners],
    ["New installations", snapshot.totals.newInstallations],
    ["Walks started", snapshot.totals.walksStarted],
    ["Walks saved", snapshot.totals.walksSaved],
  ] as const;

  return (
    <section className={styles.desk}>
      <header className={styles.header}>
        <div>
          <h1>Analytics</h1>
          <p>Aggregate {snapshot.environment === "testflight" ? "TestFlight" : "production"} activity.</p>
        </div>
        <div className={styles.headerActions}>
          <span>{isReady ? relativeTimestamp(snapshot.latestRefreshAt) : "Connection unavailable"}</span>
          <div className={styles.pickers}>
            <nav aria-label="Analytics environment" className={styles.picker}>
              {analyticsEnvironments.map((environment) => (
                <a aria-current={snapshot.environment === environment ? "page" : undefined} className={snapshot.environment === environment ? styles.selected : ""} href={rangeHref(snapshot.range, environment)} key={environment}>
                  {environment === "testflight" ? "TestFlight" : "Production"}
                </a>
              ))}
            </nav>
            <nav aria-label="Analytics period" className={styles.picker}>
              {analyticsRanges.map((range) => (
                <a aria-current={snapshot.range === range ? "page" : undefined} className={snapshot.range === range ? styles.selected : ""} href={rangeHref(range, snapshot.environment)} key={range}>
                  {range}d
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {!isReady && <p className={styles.connectionNote}>Analytics data is unavailable. Check the restricted database connection.</p>}

      <section className={styles.metricGrid} aria-label={`Product activity in the last ${snapshot.range} days`}>
        {metrics.map(([label, value]) => <article key={label}><span>{label}</span><strong>{isReady ? formatNumber(value) : "—"}</strong></article>)}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><h2>Saved walks by day</h2><span>Last {snapshot.range} days</span></div>
        <Chart snapshot={snapshot} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><h2>Processing</h2></div>
        <div className={styles.healthGrid}>
          <article><span>Success rate</span><strong>{isReady && rate !== null ? `${rate}%` : "—"}</strong></article>
          <article><span>Failed walks</span><strong>{isReady ? formatNumber(snapshot.totals.walksFailed) : "—"}</strong></article>
          <article><span>Daily-limit blocks</span><strong>{isReady ? formatNumber(snapshot.totals.dailyLimitBlocks) : "—"}</strong></article>
          <article><span>Average recording length</span><strong>{isReady ? formatDuration(averageDuration) : "—"}</strong></article>
        </div>
      </section>

      <p className={styles.privacyNote}>Analytics contains anonymous daily totals. It does not include garden entries, recordings, photos, or contact details.</p>
    </section>
  );
}
