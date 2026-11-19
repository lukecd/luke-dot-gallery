-- Account deletion for the private Sow API boundary.
--
-- The refresh token is encrypted by the API before it reaches this table. It
-- is retained only so Sign in with Apple authorization can be revoked when a
-- person deletes their account. The account deletion function removes every
-- account-linked API record. It deliberately does not retain a per-account
-- deletion event or move rows to a generic deleted account.

begin;

alter table sow_api.security_challenges
  drop constraint if exists security_challenges_purpose_check;

alter table sow_api.security_challenges
  add constraint security_challenges_purpose_check check (
    purpose in ('apple_sign_in', 'app_attest', 'app_assertion', 'apple_account_deletion')
  );

create table sow_api.apple_refresh_tokens (
  account_id uuid primary key references sow_api.accounts(id) on delete cascade,
  encrypted_refresh_token bytea not null,
  key_version smallint not null default 1 check (key_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sow_api.apple_refresh_tokens enable row level security;
create policy sow_api_runtime_access on sow_api.apple_refresh_tokens
  for all to sow_api_runtime using (true) with check (true);
revoke all on sow_api.apple_refresh_tokens from public, anon, authenticated, service_role;
grant select, insert, update, delete on sow_api.apple_refresh_tokens to sow_api_runtime;

create or replace function sow_api.delete_account(target_account_id uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  account_deleted boolean;
begin
  -- This lock is shared with API admission/finalization paths so deletion
  -- cannot race a Garden Walk operation for the same account.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(target_account_id::text));

  delete from sow_api.security_challenges where account_id = target_account_id;

  delete from sow_api.processing_provider_attempts
  where operation_request_id in (
    select id from sow_api.ai_operation_requests where account_id = target_account_id
  );

  delete from sow_api.ai_usage_events where account_id = target_account_id;
  delete from sow_api.completed_walk_usage where account_id = target_account_id;
  delete from sow_api.ai_operation_requests where account_id = target_account_id;
  delete from sow_api.entitlements where account_id = target_account_id;
  delete from sow_api.installations where account_id = target_account_id;

  delete from sow_api.accounts
  where id = target_account_id
  returning true into account_deleted;

  return coalesce(account_deleted, false);
end;
$$;

revoke all on function sow_api.delete_account(uuid)
  from public, anon, authenticated, service_role;
grant execute on function sow_api.delete_account(uuid) to sow_api_runtime;

commit;
