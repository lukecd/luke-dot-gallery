-- A durable, review-first lifecycle for the website plant-illustration queue.
-- Generation is claimed by a background worker; an approved candidate is then
-- delivered to the requester and prepared for an app-asset handoff.

begin;

alter table public.desk_plant_generation_jobs
  add column if not exists generation_started_at timestamptz,
  add column if not exists approved_asset_id uuid references public.desk_generated_plant_assets(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists delivered_at timestamptz;

create unique index if not exists desk_plant_generation_jobs_approved_asset_unique
  on public.desk_plant_generation_jobs (approved_asset_id)
  where approved_asset_id is not null;

create index if not exists desk_plant_generation_jobs_queue_idx
  on public.desk_plant_generation_jobs (created_at asc)
  where status = 'queued';

create or replace function public.desk_claim_next_plant_generation()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  claimed_id uuid;
begin
  select id into claimed_id
  from public.desk_plant_generation_jobs
  where status = 'queued'
  order by created_at asc
  for update skip locked
  limit 1;

  if claimed_id is null then return null; end if;

  update public.desk_plant_generation_jobs
  set status = 'generating', generation_started_at = now(), last_error = null
  where id = claimed_id;
  return claimed_id;
end;
$$;

create or replace function public.desk_approve_plant_candidate(p_job_id uuid, p_asset_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  job_status public.desk_plant_job_status;
  asset_status public.desk_generated_asset_status;
  asset_job_id uuid;
begin
  select status into job_status
  from public.desk_plant_generation_jobs
  where id = p_job_id
  for update;
  if job_status is distinct from 'awaiting_review'::public.desk_plant_job_status then return false; end if;

  select job_id, status into asset_job_id, asset_status
  from public.desk_generated_plant_assets
  where id = p_asset_id
  for update;
  if asset_job_id is distinct from p_job_id or asset_status is distinct from 'candidate'::public.desk_generated_asset_status then return false; end if;

  update public.desk_generated_plant_assets
  set status = 'rejected'
  where job_id = p_job_id and status = 'candidate';
  update public.desk_generated_plant_assets set status = 'approved' where id = p_asset_id;
  update public.desk_plant_generation_jobs
  set status = 'approved', approved_asset_id = p_asset_id, approved_at = now(), reviewed_at = now()
  where id = p_job_id;
  return true;
end;
$$;

revoke all on function public.desk_claim_next_plant_generation() from public, anon, authenticated;
revoke all on function public.desk_approve_plant_candidate(uuid, uuid) from public, anon, authenticated;
grant execute on function public.desk_claim_next_plant_generation() to service_role;
grant execute on function public.desk_approve_plant_candidate(uuid, uuid) to service_role;

commit;
