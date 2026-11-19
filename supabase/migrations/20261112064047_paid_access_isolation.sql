-- Isolate paid sandbox/production access while legacy free TestFlight remains available.
-- Apply before this API revision. Never drop access_policy while paid tickets exist.
begin;
alter table sow_api.ai_operation_requests add column access_policy text
  check (access_policy in ('time-v1', 'paid-sandbox-v1', 'paid-production-v1'));
create table sow_api.paid_trials (
  account_id uuid not null references sow_api.accounts(id) on delete cascade,
  environment text not null check (environment in ('sandbox', 'production')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  primary key (account_id, environment)
);
create table sow_api.paid_revenuecat_access (
  account_id uuid not null references sow_api.accounts(id) on delete cascade,
  environment text not null check (environment in ('sandbox', 'production')),
  status text not null check (status in ('active_monthly', 'active_annual', 'active_lifetime', 'grace_period', 'expired')),
  ends_at timestamptz,
  has_purchase boolean not null,
  checked_at timestamptz not null default now(),
  primary key (account_id, environment)
);
alter table sow_api.paid_trials enable row level security;
alter table sow_api.paid_revenuecat_access enable row level security;
create policy sow_api_runtime_access on sow_api.paid_trials for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.paid_revenuecat_access for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.paid_trials, sow_api.paid_revenuecat_access from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.paid_trials, sow_api.paid_revenuecat_access to sow_api_runtime;
commit;
