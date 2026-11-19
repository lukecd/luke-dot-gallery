-- Proposed only: port into the canonical sow.garden-web migration history
-- after review. Do not apply this API artifact independently to production.
begin;
create table sow_api.revenuecat_access (
  account_id uuid not null references sow_api.accounts(id) on delete cascade,
  environment text not null check (environment in ('testflight', 'production')),
  status text not null check (status in ('active_monthly', 'active_annual', 'grace_period', 'expired')),
  ends_at timestamptz not null,
  has_purchase boolean not null,
  checked_at timestamptz not null default now(),
  primary key (account_id, environment)
);
create table sow_api.revenuecat_webhook_receipts (
  event_id_hash text not null,
  environment text not null check (environment in ('testflight', 'production')),
  processed_at timestamptz not null default now(),
  primary key (event_id_hash, environment)
);
alter table sow_api.revenuecat_access enable row level security;
alter table sow_api.revenuecat_webhook_receipts enable row level security;
create policy sow_api_runtime_access on sow_api.revenuecat_access for all to sow_api_runtime using (true) with check (true);
create policy sow_api_runtime_access on sow_api.revenuecat_webhook_receipts for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.revenuecat_access, sow_api.revenuecat_webhook_receipts from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.revenuecat_access, sow_api.revenuecat_webhook_receipts to sow_api_runtime;
commit;
