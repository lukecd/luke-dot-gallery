-- Bounded, fenced global admission slots for synchronous transcription.
-- Slots contain only private operational IDs and lease metadata; no media or
-- garden content is retained. The API release starts with five enforced slots;
-- the remotely configured limit can be lowered during an incident.

begin;

alter table sow_api.ai_operation_requests
  add column if not exists admission_slot_index integer,
  add column if not exists admission_fencing_token bigint,
  add column if not exists admission_lease_token uuid,
  add column if not exists admission_lease_expires_at timestamptz;

create table if not exists sow_api.transcription_admission_slots (
  environment text not null check (environment in ('development', 'testflight', 'production')),
  pool text not null check (pool = 'transcription'),
  slot_index integer not null check (slot_index between 1 and 50),
  active_operation_request_id uuid references sow_api.ai_operation_requests(id) on delete set null,
  lease_token uuid,
  fencing_token bigint not null default 0 check (fencing_token >= 0),
  lease_expires_at timestamptz,
  primary key (environment, pool, slot_index),
  constraint transcription_admission_slots_lease_matches_operation check (
    (active_operation_request_id is null and lease_token is null and lease_expires_at is null) or
    (active_operation_request_id is not null and lease_token is not null and lease_expires_at is not null)
  )
);

insert into sow_api.transcription_admission_slots (environment, pool, slot_index)
select environment, 'transcription', slot_index
from (values ('development'), ('testflight'), ('production')) as environments(environment)
cross join generate_series(1, 50) as slot_index
on conflict do nothing;

create unique index if not exists transcription_admission_slots_active_operation_unique
  on sow_api.transcription_admission_slots (active_operation_request_id)
  where active_operation_request_id is not null;

alter table sow_api.transcription_admission_slots enable row level security;
create policy sow_api_runtime_access on sow_api.transcription_admission_slots
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.transcription_admission_slots from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.transcription_admission_slots to sow_api_runtime;

commit;
