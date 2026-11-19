begin;

create table if not exists sow_api.account_feature_usage (
  account_id uuid not null references sow_api.accounts(id) on delete cascade,
  environment text not null check (environment in ('testflight', 'production')),
  completed_walks integer not null default 0 check (completed_walks >= 0),
  completed_asks integer not null default 0 check (completed_asks >= 0),
  updated_at timestamptz not null default now(),
  primary key (account_id, environment)
);

alter table sow_api.account_feature_usage enable row level security;

create policy sow_api_runtime_access on sow_api.account_feature_usage
  for all to sow_api_runtime using (true) with check (true);

revoke all on sow_api.account_feature_usage
  from public, anon, authenticated, service_role;

grant select, insert, update, delete
  on sow_api.account_feature_usage to sow_api_runtime;

commit;