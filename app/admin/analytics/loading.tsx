import { AdminDataState } from "@/admin-components/AdminDataState";
import { AdminShell } from "@/admin-components/AdminShell";
import styles from "@/admin-components/AnalyticsDashboard.module.css";

export default function AnalyticsLoading() {
  return <AdminShell><section className={styles.desk}>
    <header className={styles.header}><div><h1>Analytics</h1><p>Aggregate TestFlight activity.</p></div></header>
    <AdminDataState state="loading" title="Loading analytics…" description="Checking aggregate activity." />
  </section></AdminShell>;
}
