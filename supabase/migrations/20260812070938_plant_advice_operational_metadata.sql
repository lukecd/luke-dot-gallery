-- Private, content-free metadata for disabled plant-advice operations.
-- The request payload itself (photos, question, memory text, weather, prompt,
-- answer, and provider response) is never written to Postgres.

begin;

alter table sow_api.ai_operation_requests
  add column if not exists input_image_count smallint,
  add column if not exists input_image_bytes integer,
  add column if not exists context_contract_version smallint,
  add column if not exists payload_fingerprint_hash text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'sow_api.ai_operation_requests'::regclass
      and conname = 'operation_requests_advice_envelope_nonnegative'
  ) then
    alter table sow_api.ai_operation_requests
      add constraint operation_requests_advice_envelope_nonnegative check (
        (input_image_count is null or input_image_count between 0 and 5)
        and (input_image_bytes is null or input_image_bytes >= 0)
        and (context_contract_version is null or context_contract_version > 0)
      );
  end if;
end $$;

create index if not exists ai_operation_requests_advice_active_idx
  on sow_api.ai_operation_requests (account_id, environment, authorized_at desc)
  where operation = 'plant_advice'
    and status in ('authorized', 'provider_started');

-- The advice pool is deliberately separate from transcription, so a burst of
-- diagnostic questions cannot consume Garden Walk capacity. Ten rows are only
-- provisioned capacity; the API's server-only limit decides how many can be
-- admitted at a given time.
create table if not exists sow_api.plant_advice_admission_slots (
  environment text not null check (environment in ('development', 'testflight', 'production')),
  pool text not null check (pool = 'plant_advice'),
  slot_index integer not null check (slot_index between 1 and 10),
  active_operation_request_id uuid references sow_api.ai_operation_requests(id) on delete set null,
  lease_token uuid,
  fencing_token bigint not null default 0 check (fencing_token >= 0),
  lease_expires_at timestamptz,
  primary key (environment, pool, slot_index),
  constraint plant_advice_admission_slots_lease_matches_operation check (
    (active_operation_request_id is null and lease_token is null and lease_expires_at is null) or
    (active_operation_request_id is not null and lease_token is not null and lease_expires_at is not null)
  )
);

insert into sow_api.plant_advice_admission_slots (environment, pool, slot_index)
select environment, 'plant_advice', slot_index
from (values ('development'), ('testflight'), ('production')) as environments(environment)
cross join generate_series(1, 10) as slot_index
on conflict do nothing;

create unique index if not exists plant_advice_admission_slots_active_operation_unique
  on sow_api.plant_advice_admission_slots (active_operation_request_id)
  where active_operation_request_id is not null;

alter table sow_api.plant_advice_admission_slots enable row level security;
create policy sow_api_runtime_access on sow_api.plant_advice_admission_slots
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.plant_advice_admission_slots
  from public, anon, authenticated, service_role, garden_desk_analytics;
grant select, insert, update, delete on sow_api.plant_advice_admission_slots to sow_api_runtime;

commit;
