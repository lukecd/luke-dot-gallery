import "server-only";

import postgres from "postgres";

export const analyticsRanges = [7, 30, 90] as const;
export type AnalyticsRange = (typeof analyticsRanges)[number];

export const analyticsEnvironments = ["testflight", "production"] as const;
export type AnalyticsEnvironment = (typeof analyticsEnvironments)[number];

type DailyMetricRow = {
  metric_date: string;
  accounts_created: number | string;
  installations_registered: number | string;
  walks_authorized: number | string;
  walks_completed: number | string;
  walks_failed: number | string;
  daily_limit_blocks: number | string;
  completed_duration_seconds_total: number | string;
  refreshed_at: string;
};

export type DailyAnalyticsMetric = {
  date: string;
  newGardeners: number;
  newInstallations: number;
  walksStarted: number;
  walksSaved: number;
  walksFailed: number;
  dailyLimitBlocks: number;
  completedDurationSeconds: number;
  refreshedAt: string;
};

export type AnalyticsSnapshot = {
  state: "ready" | "unconfigured" | "unavailable";
  range: AnalyticsRange;
  environment: AnalyticsEnvironment;
  daily: DailyAnalyticsMetric[];
  latestRefreshAt: string | null;
  totals: {
    newGardeners: number;
    newInstallations: number;
    walksStarted: number;
    walksSaved: number;
    walksFailed: number;
    dailyLimitBlocks: number;
    completedDurationSeconds: number;
  };
};

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  const parsed = Number(value);
  return analyticsRanges.includes(parsed as AnalyticsRange) ? (parsed as AnalyticsRange) : 30;
}

export function parseAnalyticsEnvironment(value: string | undefined): AnalyticsEnvironment {
  return analyticsEnvironments.includes(value as AnalyticsEnvironment)
    ? (value as AnalyticsEnvironment)
    : "testflight";
}

function emptySnapshot(
  state: AnalyticsSnapshot["state"],
  range: AnalyticsRange,
  environment: AnalyticsEnvironment,
): AnalyticsSnapshot {
  return {
    state,
    range,
    environment,
    daily: [],
    latestRefreshAt: null,
    totals: {
      newGardeners: 0,
      newInstallations: 0,
      walksStarted: 0,
      walksSaved: 0,
      walksFailed: 0,
      dailyLimitBlocks: 0,
      completedDurationSeconds: 0,
    },
  };
}

function utcDateOffset(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

/**
 * Reads only the private, identity-free daily aggregate tables. This module is
 * deliberately server-only: SOW_ANALYTICS_DATABASE_URL must belong to the
 * garden_desk_analytics role, never the API writer or browser Data API.
 */
export async function getAnalyticsSnapshot(
  range: AnalyticsRange,
  environment: AnalyticsEnvironment,
): Promise<AnalyticsSnapshot> {
  const connectionString = process.env.SOW_ANALYTICS_DATABASE_URL;
  if (!connectionString) {
    return emptySnapshot("unconfigured", range, environment);
  }

  const sql = postgres(connectionString, {
    connect_timeout: 5,
    idle_timeout: 5,
    max: 1,
    prepare: false,
    ssl: "require",
  });

  try {
    const rows = await sql<DailyMetricRow[]>`
      select
        metric_date::text,
        accounts_created,
        installations_registered,
        walks_authorized,
        walks_completed,
        walks_failed,
        daily_limit_blocks,
        completed_duration_seconds_total,
        refreshed_at::text
      from sow_analytics.daily_service_metrics
      where environment = ${environment}
        and metric_date >= (now() at time zone 'UTC')::date - (${range - 1})::integer
        and metric_date <= (now() at time zone 'UTC')::date
      order by metric_date asc
    `;

    const byDate = new Map(rows.map((row) => [row.metric_date, row]));
    const daily = Array.from({ length: range }, (_, index) => {
      const date = utcDateOffset(index - range + 1);
      const row = byDate.get(date);

      return {
        date,
        newGardeners: numberValue(row?.accounts_created),
        newInstallations: numberValue(row?.installations_registered),
        walksStarted: numberValue(row?.walks_authorized),
        walksSaved: numberValue(row?.walks_completed),
        walksFailed: numberValue(row?.walks_failed),
        dailyLimitBlocks: numberValue(row?.daily_limit_blocks),
        completedDurationSeconds: numberValue(row?.completed_duration_seconds_total),
        refreshedAt: row?.refreshed_at ?? "",
      };
    });

    const totals = daily.reduce<AnalyticsSnapshot["totals"]>(
      (running, day) => ({
        newGardeners: running.newGardeners + day.newGardeners,
        newInstallations: running.newInstallations + day.newInstallations,
        walksStarted: running.walksStarted + day.walksStarted,
        walksSaved: running.walksSaved + day.walksSaved,
        walksFailed: running.walksFailed + day.walksFailed,
        dailyLimitBlocks: running.dailyLimitBlocks + day.dailyLimitBlocks,
        completedDurationSeconds: running.completedDurationSeconds + day.completedDurationSeconds,
      }),
      emptySnapshot("ready", range, environment).totals,
    );

    return {
      state: "ready",
      range,
      environment,
      daily,
      latestRefreshAt: rows.at(-1)?.refreshed_at ?? null,
      totals,
    };
  } catch (error) {
    console.error("Garden Desk analytics read failed", error);
    return emptySnapshot("unavailable", range, environment);
  } finally {
    await sql.end({ timeout: 1 });
  }
}
