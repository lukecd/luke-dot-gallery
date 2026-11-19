begin;

create table if not exists public.desk_plant_app_handoff_batches (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('creating', 'ready', 'failed')),
  job_count integer not null check (job_count > 0),
  branch text,
  pr_url text,
  pr_number integer,
  pr_created_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.desk_plant_generation_jobs
  add column if not exists app_handoff_batch_id uuid references public.desk_plant_app_handoff_batches(id) on delete set null;

create index if not exists desk_plant_generation_jobs_handoff_batch_idx
  on public.desk_plant_generation_jobs (app_handoff_batch_id)
  where app_handoff_batch_id is not null;

alter table public.desk_plant_app_handoff_batches enable row level security;
revoke all on table public.desk_plant_app_handoff_batches from public, anon, authenticated;

commit;
