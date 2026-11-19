-- Canonical app-asset identity and a durable record of the automatic app PR.

begin;

alter table public.desk_plant_generation_jobs
  add column if not exists canonical_name text,
  add column if not exists canonical_key text,
  add column if not exists canonical_aliases jsonb not null default '[]'::jsonb,
  add column if not exists app_asset_name text,
  add column if not exists app_pr_branch text,
  add column if not exists app_pr_url text,
  add column if not exists app_pr_number integer,
  add column if not exists app_pr_created_at timestamptz,
  add column if not exists app_pr_error text;

create unique index if not exists desk_plant_generation_jobs_canonical_key_unique
  on public.desk_plant_generation_jobs (canonical_key)
  where canonical_key is not null;

commit;
