begin;

-- The API stores only bounded operational metadata. Audio, transcripts,
-- prompts, and generated garden writing never enter this schema.
alter table sow_api.ai_operation_requests
  add column input_duration_seconds double precision,
  add column upload_ticket_hash text,
  add column upload_ticket_expires_at timestamptz,
  add column upload_consumed_at timestamptz,
  add constraint operation_requests_duration_nonnegative check (
    input_duration_seconds is null or input_duration_seconds >= 0
  ),
  add constraint operation_requests_ticket_expiry_matches_ticket check (
    (upload_ticket_hash is null and upload_ticket_expires_at is null) or
    (upload_ticket_hash is not null and upload_ticket_expires_at is not null)
  );

create index ai_operation_requests_upload_ticket_idx
  on sow_api.ai_operation_requests (upload_ticket_hash)
  where upload_consumed_at is null and upload_ticket_expires_at is not null;

alter table sow_api.ai_usage_events
  add column input_duration_seconds double precision,
  add constraint usage_events_duration_nonnegative check (
    input_duration_seconds is null or input_duration_seconds >= 0
  );

commit;
