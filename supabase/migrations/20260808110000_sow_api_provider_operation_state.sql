-- Phase 1 transcription operation metadata. This extends the private
-- sow_api boundary only; no garden content, audio, transcript, prompt, or
-- generated text is retained here.
--
-- Deploy this migration before the matching API release. Existing request rows
-- keep their historical states and semantics.

begin;

alter type sow_api.request_status add value if not exists 'provider_started';
alter type sow_api.request_status add value if not exists 'known_failed';
alter type sow_api.request_status add value if not exists 'outcome_unknown';
alter type sow_api.request_status add value if not exists 'expired';

alter table sow_api.ai_operation_requests
  add column if not exists provider_started_at timestamptz,
  add column if not exists quota_counted_at timestamptz,
  add column if not exists terminal_at timestamptz,
  add column if not exists provider_attempt_count integer not null default 0
    check (provider_attempt_count >= 0);

create index if not exists ai_operation_requests_provider_quota_idx
  on sow_api.ai_operation_requests (
    account_id,
    environment,
    operation,
    quota_counted_at desc
  )
  where quota_counted_at is not null;

create table if not exists sow_api.processing_provider_attempts (
  id uuid primary key default gen_random_uuid(),
  operation_request_id uuid not null references sow_api.ai_operation_requests(id) on delete restrict,
  attempt_ordinal integer not null check (attempt_ordinal > 0),
  state text not null check (state in ('started', 'completed', 'known_failed', 'outcome_unknown')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  failure_code text,
  constraint processing_provider_attempts_operation_ordinal_unique
    unique (operation_request_id, attempt_ordinal),
  constraint processing_provider_attempts_terminal_time_matches_state check (
    (state = 'started' and finished_at is null) or
    (state <> 'started' and finished_at is not null)
  )
);

create index if not exists processing_provider_attempts_open_idx
  on sow_api.processing_provider_attempts (started_at asc)
  where state = 'started';

alter table sow_api.processing_provider_attempts enable row level security;
create policy sow_api_runtime_access on sow_api.processing_provider_attempts
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.processing_provider_attempts from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.processing_provider_attempts to sow_api_runtime;

commit;
