-- Private server-only foundation for sow.garden-api.
-- This schema is deliberately absent from the Supabase Data API configuration.
-- The runtime role is unable to log in until its secret is provisioned separately.

begin;

create schema if not exists sow_api;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'sow_api_runtime') then
    create role sow_api_runtime
      login
      noinherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      nobypassrls;
  end if;
end $$;

revoke all on schema sow_api from public, anon, authenticated, service_role;

do $$
begin
  create type sow_api.entitlement_status as enum (
    'trial', 'active_monthly', 'active_annual', 'expired', 'grace_period', 'suspended'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type sow_api.ai_operation as enum (
    'transcription', 'walk_parsing', 'share_moment_composition', 'walk_poem_composition'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type sow_api.installation_status as enum ('active', 'revoked');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type sow_api.request_status as enum ('authorized', 'completed', 'rejected', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists sow_api.accounts (
  id uuid primary key default gen_random_uuid(),
  apple_subject_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_apple_subject_hash_not_blank check (btrim(apple_subject_hash) <> '')
);

create table if not exists sow_api.installations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references sow_api.accounts(id) on delete restrict,
  app_attest_key_id_hash text not null unique,
  status sow_api.installation_status not null default 'active',
  registered_at timestamptz not null default now(),
  last_verified_at timestamptz,
  revoked_at timestamptz,
  constraint installations_key_hash_not_blank check (btrim(app_attest_key_id_hash) <> ''),
  constraint installations_revocation_matches_status check (
    (status = 'revoked' and revoked_at is not null) or
    (status = 'active' and revoked_at is null)
  )
);

create index if not exists installations_account_id_idx on sow_api.installations (account_id);

create table if not exists sow_api.entitlement_policies (
  environment text primary key check (environment in ('testflight', 'production')),
  free_ai_days smallint not null check (free_ai_days in (7, 90)),
  updated_at timestamptz not null default now()
);

insert into sow_api.entitlement_policies (environment, free_ai_days)
values ('testflight', 90), ('production', 7)
on conflict (environment) do nothing;

create table if not exists sow_api.entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references sow_api.accounts(id) on delete restrict,
  status sow_api.entitlement_status not null,
  environment text not null check (environment in ('testflight', 'production')),
  source text not null check (source in ('trial', 'app_store', 'operator')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  trial_started_at timestamptz,
  original_transaction_id_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entitlements_trial_start_matches_source check (
    (source = 'trial' and trial_started_at is not null) or source <> 'trial'
  ),
  constraint entitlements_end_not_before_start check (ends_at is null or ends_at >= starts_at)
);

create index if not exists entitlements_account_environment_idx
  on sow_api.entitlements (account_id, environment, starts_at desc);

create table if not exists sow_api.ai_operation_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references sow_api.accounts(id) on delete restrict,
  installation_id uuid not null references sow_api.installations(id) on delete restrict,
  operation sow_api.ai_operation not null,
  status sow_api.request_status not null,
  idempotency_key_hash text not null,
  request_body_hash text not null,
  input_bytes integer check (input_bytes is null or input_bytes >= 0),
  authorized_at timestamptz not null default now(),
  completed_at timestamptz,
  failure_code text,
  constraint operation_requests_idempotency_unique unique (account_id, operation, idempotency_key_hash),
  constraint operation_requests_key_hash_not_blank check (btrim(idempotency_key_hash) <> ''),
  constraint operation_requests_body_hash_not_blank check (btrim(request_body_hash) <> '')
);

create index if not exists ai_operation_requests_account_operation_idx
  on sow_api.ai_operation_requests (account_id, operation, authorized_at desc);
create index if not exists ai_operation_requests_installation_idx
  on sow_api.ai_operation_requests (installation_id, authorized_at desc);

create table if not exists sow_api.ai_usage_events (
  id bigint generated always as identity primary key,
  account_id uuid not null references sow_api.accounts(id) on delete restrict,
  installation_id uuid not null references sow_api.installations(id) on delete restrict,
  operation_request_id uuid references sow_api.ai_operation_requests(id) on delete set null,
  operation sow_api.ai_operation not null,
  outcome text not null check (outcome in ('success', 'rejected', 'failed')),
  occurred_at timestamptz not null default now(),
  input_bytes integer check (input_bytes is null or input_bytes >= 0),
  output_bytes integer check (output_bytes is null or output_bytes >= 0),
  provider_cost_microunits bigint check (provider_cost_microunits is null or provider_cost_microunits >= 0)
);

create index if not exists ai_usage_events_daily_idx
  on sow_api.ai_usage_events (occurred_at desc, operation, outcome);

create table if not exists sow_api.daily_analytics_rollups (
  metric_date date not null,
  environment text not null check (environment in ('testflight', 'production')),
  accounts_created integer not null default 0 check (accounts_created >= 0),
  trials_started integer not null default 0 check (trials_started >= 0),
  active_entitlements integer not null default 0 check (active_entitlements >= 0),
  operations_authorized integer not null default 0 check (operations_authorized >= 0),
  operations_completed integer not null default 0 check (operations_completed >= 0),
  quota_blocks integer not null default 0 check (quota_blocks >= 0),
  updated_at timestamptz not null default now(),
  primary key (metric_date, environment)
);

create or replace function sow_api.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function sow_api.set_updated_at() from public, anon, authenticated, service_role;

create trigger accounts_set_updated_at before update on sow_api.accounts
for each row execute function sow_api.set_updated_at();
create trigger entitlement_policies_set_updated_at before update on sow_api.entitlement_policies
for each row execute function sow_api.set_updated_at();
create trigger entitlements_set_updated_at before update on sow_api.entitlements
for each row execute function sow_api.set_updated_at();

alter table sow_api.accounts enable row level security;
alter table sow_api.installations enable row level security;
alter table sow_api.entitlement_policies enable row level security;
alter table sow_api.entitlements enable row level security;
alter table sow_api.ai_operation_requests enable row level security;
alter table sow_api.ai_usage_events enable row level security;
alter table sow_api.daily_analytics_rollups enable row level security;

create policy sow_api_runtime_access on sow_api.accounts for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.installations for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.entitlement_policies for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.entitlements for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.ai_operation_requests for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.ai_usage_events for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.daily_analytics_rollups for all to sow_api_runtime using (true) with check (true);

revoke all on all tables in schema sow_api from public, anon, authenticated, service_role;
revoke all on all sequences in schema sow_api from public, anon, authenticated, service_role;
grant usage on schema sow_api to sow_api_runtime;
grant select, insert, update, delete on all tables in schema sow_api to sow_api_runtime;
grant usage, select on all sequences in schema sow_api to sow_api_runtime;
alter default privileges in schema sow_api revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema sow_api revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges in schema sow_api revoke all on functions from public, anon, authenticated, service_role;
alter default privileges in schema sow_api grant select, insert, update, delete on tables to sow_api_runtime;
alter default privileges in schema sow_api grant usage, select on sequences to sow_api_runtime;

commit;
