-- Private, content-free operational metadata for Ask audio transcription.
-- Audio, transcripts, questions, prompts, answers, and provider response bodies
-- are never written to Postgres. Ask transcription shares only the existing
-- plant_advice admission pool; it does not consume Garden Walk transcription
-- slots.

begin;

alter table sow_api.ai_operation_requests
  add column if not exists client_operation_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'sow_api.ai_operation_requests'::regclass
      and conname = 'operation_requests_ask_transcription_client_id'
  ) then
    alter table sow_api.ai_operation_requests
      add constraint operation_requests_ask_transcription_client_id check (
        (operation = 'plant_advice_transcription' and client_operation_id is not null)
        or
        (operation <> 'plant_advice_transcription' and client_operation_id is null)
      );
  end if;
end $$;

comment on column sow_api.ai_operation_requests.client_operation_id is
  'Content-free client UUID reserved for plant_advice_transcription idempotency.';

-- Prevent a rotated HMAC key from authorizing the same client transcription ID
-- twice while retaining the existing hashed idempotency lookup used by the API.
create unique index if not exists ai_operation_requests_ask_transcription_client_id_idx
  on sow_api.ai_operation_requests (account_id, environment, client_operation_id)
  where operation = 'plant_advice_transcription';

-- Authorization and provider-start limits use different timestamps. Keep each
-- Ask transcription path on a small, operation-specific partial index.
create index if not exists ai_operation_requests_ask_transcription_authorized_idx
  on sow_api.ai_operation_requests (account_id, environment, authorized_at desc)
  where operation = 'plant_advice_transcription';

create index if not exists ai_operation_requests_ask_transcription_quota_idx
  on sow_api.ai_operation_requests (account_id, environment, quota_counted_at desc)
  where operation = 'plant_advice_transcription'
    and quota_counted_at is not null;

-- Ticket recovery intentionally includes consumed and fresh tickets.
create index if not exists ai_operation_requests_ask_transcription_ticket_idx
  on sow_api.ai_operation_requests (environment, upload_ticket_hash)
  where operation = 'plant_advice_transcription';

-- Account deletion must clear a shared Ask admission lease before the request
-- row is removed. The existing function is operation-neutral and safely clears
-- the slot selected by the request ID.
drop trigger if exists clear_deleted_plant_advice_lease
  on sow_api.ai_operation_requests;

create trigger clear_deleted_plant_advice_lease
  before delete on sow_api.ai_operation_requests
  for each row when (
    old.operation in ('plant_advice', 'plant_advice_transcription')
  )
  execute function sow_api.clear_deleted_plant_advice_lease();

-- Existing RLS and the sow_api_runtime grant cover the added column. Reassert
-- that the operational table remains unavailable to client and analytics roles.
revoke all on sow_api.ai_operation_requests
  from public, anon, authenticated, service_role, garden_desk_analytics;

commit;
