"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import { ActionButton } from "@/admin-components/ActionButton";

type Category = { id: string; name: string; purpose: string | null; sort_order: number };

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestCategories = useCallback(async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json() as { categories?: Category[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Could not load categories.");
    return data.categories ?? [];
  }, []);
  const load = useCallback(async () => {
    setRefreshing(true);
    try { setCategories(await requestCategories()); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load categories."); }
    finally { setRefreshing(false); }
  }, [requestCategories]);
  useEffect(() => {
    let current = true;
    void requestCategories().then((nextCategories) => {
      if (current) { setCategories(nextCategories); setError(null); }
    }).catch((caught: unknown) => {
      if (current) setError(caught instanceof Error ? caught.message : "Could not load categories.");
    });
    return () => { current = false; };
  }, [requestCategories]);
  return <section className={styles.subscriberWorkspace}><header className={styles.compactHeader}><div><p className={styles.eyebrow}>Categories</p><h1>Patterns worth returning to</h1><span>Categories will help organize repeated patterns in Luke’s Apps intake.</span></div><ActionButton size="compact" variant="secondary" loading={refreshing} loadingLabel="Refreshing…" onClick={() => { void load(); }}>Refresh</ActionButton></header>{categories === null && !error ? <AdminDataState state="loading" title="Loading categories…" description="Checking the current category list." /> : null}{error ? <AdminDataState state="error" title="Categories could not load." description={`${error} No data has been changed.`} onRetry={() => { void load(); }} /> : null}{categories?.length === 0 ? <AdminDataState state="empty" title="No categories yet." description="Create categories when repeat patterns make them useful." /> : null}{categories && categories.length > 0 ? <section className={styles.subscriberLedger}><div className={styles.subscriberColumns}><span>Name</span><span>Purpose</span><span>Order</span><span /></div>{categories.map((category) => <article key={category.id}><strong>{category.name}</strong><span>{category.purpose || "No purpose recorded."}</span><time>{category.sort_order}</time><span /></article>)}</section> : null}</section>;
}
