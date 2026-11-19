-- Private, content-free metadata needed by the direct plant-advice API.
-- Questions, answers, photos, prompts, location and provider response bodies
-- are never written to Postgres.

begin;

alter table sow_api.ai_usage_events
  add column if not exists provider_model text,
  add column if not exists provider_configuration_version text,
  add column if not exists provider_prompt_version smallint,
  add column if not exists provider_input_tokens integer,
  add column if not exists provider_cached_input_tokens integer,
  add column if not exists provider_output_tokens integer,
  add column if not exists provider_milliseconds integer;

alter table sow_api.ai_usage_events
  add constraint advice_usage_metadata_bounds check (
    (provider_model is null or length(provider_model) between 1 and 128)
    and (provider_configuration_version is null or length(provider_configuration_version) between 1 and 64)
    and (provider_prompt_version is null or provider_prompt_version > 0)
    and (provider_input_tokens is null or provider_input_tokens between 0 and 10000000)
    and (provider_cached_input_tokens is null or (provider_input_tokens is not null and provider_cached_input_tokens between 0 and provider_input_tokens))
    and (provider_output_tokens is null or provider_output_tokens between 0 and 10000000)
    and (provider_milliseconds is null or provider_milliseconds >= 0)
  );

-- Reservation rate limits include terminal and abandoned authorizations.
create index if not exists ai_operation_requests_advice_authorized_idx
  on sow_api.ai_operation_requests (account_id, environment, authorized_at desc)
  where operation = 'plant_advice';

-- Recovery looks up consumed as well as fresh tickets. The existing partial
-- unconsumed-ticket index cannot serve that lookup, including random tickets.
create index if not exists ai_operation_requests_advice_ticket_idx
  on sow_api.ai_operation_requests (environment, upload_ticket_hash)
  where operation = 'plant_advice';

-- Account deletion removes operation rows. ON DELETE SET NULL on the slot
-- alone conflicts with its lease_matches_operation check unless the rest of
-- the lease is cleared too. This trigger only runs for plant-advice rows.
create function sow_api.clear_deleted_plant_advice_lease()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update sow_api.plant_advice_admission_slots
    set active_operation_request_id = null,
        lease_token = null,
        lease_expires_at = null
    where active_operation_request_id = old.id;
  return old;
end;
$$;

revoke all on function sow_api.clear_deleted_plant_advice_lease()
  from public, anon, authenticated, service_role, garden_desk_analytics;
grant execute on function sow_api.clear_deleted_plant_advice_lease() to sow_api_runtime;

create trigger clear_deleted_plant_advice_lease
  before delete on sow_api.ai_operation_requests
  for each row when (old.operation = 'plant_advice')
  execute function sow_api.clear_deleted_plant_advice_lease();

-- Existing RLS and grants cover the added columns. Preserve the private
-- operational boundary and never expose sow_api through the Data API.
revoke all on sow_api.ai_usage_events, sow_api.plant_advice_admission_slots
  from public, anon, authenticated, service_role, garden_desk_analytics;

commit;
