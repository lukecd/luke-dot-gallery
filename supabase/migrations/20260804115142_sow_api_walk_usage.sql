-- Private, pseudonymous Garden Walk usage for sow.garden-api.
--
-- The API receives an HMAC of its opaque client operation identifier, never a
-- local walk ID. The recorder supplies its actual duration when available;
-- missing duration remains NULL rather than being estimated from payload size.

begin;

-- The API role receives only the private schema grant. These revocations make
-- that boundary explicit for existing and future website-owned public tables.
revoke all on all tables in schema public from sow_api_runtime;
revoke all on all sequences in schema public from sow_api_runtime;
revoke all on all functions in schema public from sow_api_runtime;
alter default privileges in schema public revoke all on tables from sow_api_runtime;
alter default privileges in schema public revoke all on sequences from sow_api_runtime;
alter default privileges in schema public revoke execute on functions from sow_api_runtime;

create table sow_api.completed_walk_usage (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references sow_api.accounts(id) on delete restrict,
  installation_id uuid not null references sow_api.installations(id) on delete restrict,
  environment text not null check (environment in ('testflight', 'production')),
  operation_id_hash text not null,
  completed_at timestamptz not null default now(),
  walk_duration_seconds integer,
  app_version text,
  platform text not null default 'ios' check (platform = 'ios'),
  created_at timestamptz not null default now(),
  constraint completed_walk_usage_operation_id_not_blank
    check (btrim(operation_id_hash) <> ''),
  constraint completed_walk_usage_duration_is_reasonable
    check (walk_duration_seconds is null or walk_duration_seconds between 0 and 86400),
  constraint completed_walk_usage_operation_unique
    unique (account_id, environment, operation_id_hash)
);

create index completed_walk_usage_account_completed_idx
  on sow_api.completed_walk_usage (account_id, completed_at desc);
create index completed_walk_usage_environment_completed_idx
  on sow_api.completed_walk_usage (environment, completed_at desc);

-- The API must increment rollups in the same transaction that inserts a new
-- completed-walk row. The uniqueness constraint above makes retry handling
-- idempotent; no trigger is used so reporting policy remains in the server.
alter table sow_api.daily_analytics_rollups
  add column completed_walks integer not null default 0 check (completed_walks >= 0),
  add column first_completed_walks integer not null default 0 check (first_completed_walks >= 0),
  add column known_walk_duration_seconds bigint not null default 0
    check (known_walk_duration_seconds >= 0),
  add column walks_with_known_duration integer not null default 0
    check (walks_with_known_duration >= 0);

alter table sow_api.completed_walk_usage enable row level security;
create policy sow_api_runtime_access on sow_api.completed_walk_usage
  for all to sow_api_runtime using (true) with check (true);

revoke all on sow_api.completed_walk_usage from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.completed_walk_usage to sow_api_runtime;

commit;
