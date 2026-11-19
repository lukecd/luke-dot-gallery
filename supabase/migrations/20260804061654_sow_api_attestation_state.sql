begin;

alter table sow_api.installations
  add column app_attest_public_key_spki bytea,
  add column assertion_counter bigint not null default 0 check (assertion_counter >= 0),
  add column attestation_verified_at timestamptz;

alter table sow_api.installations
  add constraint installations_active_requires_attestation check (
    status <> 'active' or (
      app_attest_public_key_spki is not null and
      attestation_verified_at is not null
    )
  );

create table sow_api.security_challenges (
  id uuid primary key default gen_random_uuid(),
  purpose text not null check (purpose in ('apple_sign_in', 'app_attest', 'app_assertion')),
  challenge_hash text not null unique,
  account_id uuid references sow_api.accounts(id) on delete cascade,
  installation_id uuid references sow_api.installations(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  constraint security_challenges_expiry_after_creation check (expires_at > created_at)
);

create index security_challenges_expiry_idx
  on sow_api.security_challenges (expires_at)
  where consumed_at is null;

alter table sow_api.security_challenges enable row level security;
create policy sow_api_runtime_access on sow_api.security_challenges
  for all to sow_api_runtime using (true) with check (true);
grant select, insert, update, delete on sow_api.security_challenges to sow_api_runtime;

commit;
