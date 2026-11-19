-- Private operational-schema repair and aggregate-only analytics foundation.
--
-- This is deliberately a new migration: the API code must agree with the
-- canonical shared migration history, and previously applied migrations must
-- never be rewritten. Neither schema is exposed through Supabase's Data API.

begin;

create schema if not exists sow_analytics;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'garden_desk_analytics') then
    create role garden_desk_analytics
      login
      noinherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      nobypassrls;
  end if;
end $$;

alter role garden_desk_analytics set default_transaction_read_only = on;
alter role garden_desk_analytics set statement_timeout = '5s';

revoke all on schema sow_analytics from public, anon, authenticated, service_role;
revoke all on schema sow_analytics from sow_api_runtime;
revoke all on schema sow_api from garden_desk_analytics;

-- These values are server configuration, not client input. Historical rows
-- are intentionally not backfilled: their environment is unknown.
alter table sow_api.accounts
  add column created_environment text check (created_environment in ('development', 'testflight', 'production'));

alter table sow_api.installations
  add column registered_environment text check (registered_environment in ('development', 'testflight', 'production'));

alter table sow_api.ai_operation_requests
  add column if not exists environment text check (environment in ('development', 'testflight', 'production')),
  add column if not exists input_duration_seconds double precision,
  add column if not exists upload_ticket_hash text,
  add column if not exists upload_ticket_expires_at timestamptz,
  add column if not exists upload_consumed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'sow_api.ai_operation_requests'::regclass
      and conname = 'operation_requests_duration_nonnegative'
  ) then
    alter table sow_api.ai_operation_requests
      add constraint operation_requests_duration_nonnegative check (
        input_duration_seconds is null or input_duration_seconds >= 0
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'sow_api.ai_operation_requests'::regclass
      and conname = 'operation_requests_ticket_expiry_matches_ticket'
  ) then
    alter table sow_api.ai_operation_requests
      add constraint operation_requests_ticket_expiry_matches_ticket check (
        (upload_ticket_hash is null and upload_ticket_expires_at is null) or
        (upload_ticket_hash is not null and upload_ticket_expires_at is not null)
      );
  end if;
end $$;

create index if not exists ai_operation_requests_upload_ticket_idx
  on sow_api.ai_operation_requests (upload_ticket_hash)
  where upload_consumed_at is null and upload_ticket_expires_at is not null;

alter table sow_api.ai_usage_events
  add column if not exists environment text check (environment in ('development', 'testflight', 'production')),
  add column if not exists input_duration_seconds double precision;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'sow_api.ai_usage_events'::regclass
      and conname = 'usage_events_duration_nonnegative'
  ) then
    alter table sow_api.ai_usage_events
      add constraint usage_events_duration_nonnegative check (
        input_duration_seconds is null or input_duration_seconds >= 0
      );
  end if;
end $$;

create table sow_api.processing_control_events (
  id bigint generated always as identity primary key,
  environment text not null check (environment in ('development', 'testflight', 'production')),
  event_type text not null check (event_type in ('walk_rejected', 'daily_limit_block')),
  occurred_at timestamptz not null default now()
);

create index processing_control_events_daily_idx
  on sow_api.processing_control_events (occurred_at desc, environment, event_type);

alter table sow_api.processing_control_events enable row level security;
create policy sow_api_runtime_access on sow_api.processing_control_events
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.processing_control_events from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.processing_control_events to sow_api_runtime;

create table sow_analytics.daily_service_metrics (
  metric_date date not null,
  environment text not null check (environment in ('development', 'testflight', 'production')),
  accounts_created integer not null default 0 check (accounts_created >= 0),
  installations_registered integer not null default 0 check (installations_registered >= 0),
  distinct_accounts_authorized integer not null default 0 check (distinct_accounts_authorized >= 0),
  distinct_installations_authorized integer not null default 0 check (distinct_installations_authorized >= 0),
  walks_authorized integer not null default 0 check (walks_authorized >= 0),
  walks_completed integer not null default 0 check (walks_completed >= 0),
  walks_failed integer not null default 0 check (walks_failed >= 0),
  walks_rejected integer not null default 0 check (walks_rejected >= 0),
  daily_limit_blocks integer not null default 0 check (daily_limit_blocks >= 0),
  completed_input_bytes bigint not null default 0 check (completed_input_bytes >= 0),
  completed_output_bytes bigint not null default 0 check (completed_output_bytes >= 0),
  completed_duration_seconds_total double precision not null default 0 check (completed_duration_seconds_total >= 0),
  completed_duration_seconds_average double precision,
  completed_duration_seconds_median double precision,
  completed_duration_seconds_p95 double precision,
  costed_walks integer not null default 0 check (costed_walks >= 0),
  provider_cost_microunits bigint,
  refreshed_at timestamptz not null default now(),
  primary key (metric_date, environment),
  constraint daily_service_metrics_provider_cost_nonnegative check (
    provider_cost_microunits is null or provider_cost_microunits >= 0
  )
);

create table sow_analytics.daily_recording_duration_buckets (
  metric_date date not null,
  environment text not null check (environment in ('development', 'testflight', 'production')),
  bucket_upper_seconds integer not null check (bucket_upper_seconds in (30, 60, 120, 180, 240, 300)),
  completed_walks integer not null default 0 check (completed_walks >= 0),
  refreshed_at timestamptz not null default now(),
  primary key (metric_date, environment, bucket_upper_seconds)
);

alter table sow_analytics.daily_service_metrics enable row level security;
alter table sow_analytics.daily_recording_duration_buckets enable row level security;

create policy garden_desk_analytics_read on sow_analytics.daily_service_metrics
  for select to garden_desk_analytics using (true);
create policy garden_desk_analytics_read on sow_analytics.daily_recording_duration_buckets
  for select to garden_desk_analytics using (true);

-- Recomputing avoids unverified counter drift. SECURITY DEFINER is confined
-- to this private schema, has a fixed search path, accepts typed values only,
-- and is executable solely by the API runtime role.
create or replace function sow_api.refresh_daily_analytics(
  target_date date,
  target_environment text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_environment not in ('development', 'testflight', 'production') then
    raise exception 'Invalid Sow environment';
  end if;

  perform pg_advisory_xact_lock(hashtext('sow_analytics:' || target_date::text || ':' || target_environment));

  insert into sow_analytics.daily_service_metrics (
    metric_date, environment, accounts_created, installations_registered,
    distinct_accounts_authorized, distinct_installations_authorized,
    walks_authorized, walks_completed, walks_failed, walks_rejected,
    daily_limit_blocks, completed_input_bytes, completed_output_bytes,
    completed_duration_seconds_total, completed_duration_seconds_average,
    completed_duration_seconds_median, completed_duration_seconds_p95,
    costed_walks, provider_cost_microunits, refreshed_at
  )
  select
    target_date,
    target_environment,
    (select count(*) from sow_api.accounts a
      where a.created_environment = target_environment and a.created_at >= target_date
        and a.created_at < target_date + 1),
    (select count(*) from sow_api.installations i
      where i.registered_environment = target_environment and i.registered_at >= target_date
        and i.registered_at < target_date + 1),
    (select count(distinct r.account_id) from sow_api.ai_operation_requests r
      where r.environment = target_environment and r.authorized_at >= target_date
        and r.authorized_at < target_date + 1 and r.operation = 'transcription'),
    (select count(distinct r.installation_id) from sow_api.ai_operation_requests r
      where r.environment = target_environment and r.authorized_at >= target_date
        and r.authorized_at < target_date + 1 and r.operation = 'transcription'),
    (select count(*) from sow_api.ai_operation_requests r
      where r.environment = target_environment and r.authorized_at >= target_date
        and r.authorized_at < target_date + 1 and r.operation = 'transcription'),
    (select count(*) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'),
    (select count(*) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'failed'),
    (select count(*) from sow_api.processing_control_events c
      where c.environment = target_environment and c.occurred_at >= target_date
        and c.occurred_at < target_date + 1 and c.event_type = 'walk_rejected'),
    (select count(*) from sow_api.processing_control_events c
      where c.environment = target_environment and c.occurred_at >= target_date
        and c.occurred_at < target_date + 1 and c.event_type = 'daily_limit_block'),
    coalesce((select sum(u.input_bytes)::bigint from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'), 0),
    coalesce((select sum(u.output_bytes)::bigint from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'), 0),
    coalesce((select sum(u.input_duration_seconds) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'), 0),
    (select avg(u.input_duration_seconds) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'),
    (select percentile_cont(0.5) within group (order by u.input_duration_seconds) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'),
    (select percentile_cont(0.95) within group (order by u.input_duration_seconds) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription' and u.outcome = 'success'),
    (select count(*) from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription'
        and u.outcome = 'success' and u.provider_cost_microunits is not null),
    (select sum(u.provider_cost_microunits)::bigint from sow_api.ai_usage_events u
      where u.environment = target_environment and u.occurred_at >= target_date
        and u.occurred_at < target_date + 1 and u.operation = 'transcription'
        and u.outcome = 'success' and u.provider_cost_microunits is not null),
    now()
  on conflict (metric_date, environment) do update set
    accounts_created = excluded.accounts_created,
    installations_registered = excluded.installations_registered,
    distinct_accounts_authorized = excluded.distinct_accounts_authorized,
    distinct_installations_authorized = excluded.distinct_installations_authorized,
    walks_authorized = excluded.walks_authorized,
    walks_completed = excluded.walks_completed,
    walks_failed = excluded.walks_failed,
    walks_rejected = excluded.walks_rejected,
    daily_limit_blocks = excluded.daily_limit_blocks,
    completed_input_bytes = excluded.completed_input_bytes,
    completed_output_bytes = excluded.completed_output_bytes,
    completed_duration_seconds_total = excluded.completed_duration_seconds_total,
    completed_duration_seconds_average = excluded.completed_duration_seconds_average,
    completed_duration_seconds_median = excluded.completed_duration_seconds_median,
    completed_duration_seconds_p95 = excluded.completed_duration_seconds_p95,
    costed_walks = excluded.costed_walks,
    provider_cost_microunits = excluded.provider_cost_microunits,
    refreshed_at = excluded.refreshed_at;

  insert into sow_analytics.daily_recording_duration_buckets (
    metric_date, environment, bucket_upper_seconds, completed_walks, refreshed_at
  )
  select target_date, target_environment, bucket.bucket_upper_seconds,
    count(u.id)::integer, now()
  from (values (30), (60), (120), (180), (240), (300)) as bucket(bucket_upper_seconds)
  left join sow_api.ai_usage_events u
    on u.environment = target_environment
    and u.occurred_at >= target_date
    and u.occurred_at < target_date + 1
    and u.operation = 'transcription'
    and u.outcome = 'success'
    and u.input_duration_seconds is not null
    and u.input_duration_seconds <= bucket.bucket_upper_seconds
    and (bucket.bucket_upper_seconds = 30 or u.input_duration_seconds > bucket.bucket_upper_seconds - 30)
  group by bucket.bucket_upper_seconds
  on conflict (metric_date, environment, bucket_upper_seconds) do update set
    completed_walks = excluded.completed_walks,
    refreshed_at = excluded.refreshed_at;
end;
$$;

revoke all on function sow_api.refresh_daily_analytics(date, text) from public, anon, authenticated, service_role, garden_desk_analytics;
grant execute on function sow_api.refresh_daily_analytics(date, text) to sow_api_runtime;

revoke all on all tables in schema sow_analytics from public, anon, authenticated, service_role, sow_api_runtime;
grant usage on schema sow_analytics to garden_desk_analytics;
grant select on sow_analytics.daily_service_metrics, sow_analytics.daily_recording_duration_buckets to garden_desk_analytics;
alter default privileges in schema sow_analytics revoke all on tables from public, anon, authenticated, service_role, sow_api_runtime;
alter default privileges in schema sow_analytics revoke all on functions from public, anon, authenticated, service_role, garden_desk_analytics;

commit;
