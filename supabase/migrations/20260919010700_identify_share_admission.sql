-- Bounded, fenced admission slots for Identify and generated share.
-- These operations have no ai_operation_requests row. The lease id is a
-- request UUID, not a foreign key, so a missing operation cannot block
-- release. Twenty rows are only provisioned capacity; the API's
-- SOW_IDENTIFY_SHARE_ADMISSION_LIMIT decides how many can be admitted.

begin;

create table if not exists sow_api.identify_share_admission_slots (
  environment text not null check (environment in ('development', 'testflight', 'production')),
  pool text not null check (pool = 'identify_share'),
  slot_index integer not null check (slot_index between 1 and 20),
  active_operation_request_id uuid,
  lease_token uuid,
  fencing_token bigint not null default 0 check (fencing_token >= 0),
  lease_expires_at timestamptz,
  primary key (environment, pool, slot_index),
  constraint identify_share_admission_slots_lease_matches_operation check (
    (active_operation_request_id is null and lease_token is null and lease_expires_at is null) or
    (active_operation_request_id is not null and lease_token is not null and lease_expires_at is not null)
  )
);

insert into sow_api.identify_share_admission_slots (environment, pool, slot_index)
select environment, 'identify_share', slot_index
from (values ('development'), ('testflight'), ('production')) as environments(environment)
cross join generate_series(1, 20) as slot_index
on conflict do nothing;

create unique index if not exists identify_share_admission_slots_active_operation_unique
  on sow_api.identify_share_admission_slots (active_operation_request_id)
  where active_operation_request_id is not null;

alter table sow_api.identify_share_admission_slots enable row level security;
create policy sow_api_runtime_access on sow_api.identify_share_admission_slots
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.identify_share_admission_slots
  from public, anon, authenticated, service_role, garden_desk_analytics;
grant select, insert, update, delete on sow_api.identify_share_admission_slots to sow_api_runtime;

commit;
