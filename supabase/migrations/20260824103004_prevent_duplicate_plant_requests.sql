-- A request key makes duplicate illustration requests impossible to queue,
-- including requests submitted at the same moment from separate browsers.
-- Keep the oldest existing request as the canonical record; older duplicate
-- rows remain reviewable and can be removed in Garden Desk.

begin;

alter table public.desk_plant_generation_jobs
  add column if not exists request_key text;

with ranked_jobs as (
  select
    id,
    regexp_replace(lower(btrim(requested_plant_name)), '[^a-z0-9]+', '', 'g') as normalized_key,
    row_number() over (
      partition by regexp_replace(lower(btrim(requested_plant_name)), '[^a-z0-9]+', '', 'g')
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.desk_plant_generation_jobs
)
update public.desk_plant_generation_jobs as job
set request_key = case when ranked_jobs.duplicate_rank = 1 then ranked_jobs.normalized_key else null end
from ranked_jobs
where job.id = ranked_jobs.id;

alter table public.desk_plant_generation_jobs
  add constraint desk_plant_generation_jobs_request_key_not_blank
  check (request_key is null or btrim(request_key) <> '');

create unique index if not exists desk_plant_generation_jobs_request_key_unique
  on public.desk_plant_generation_jobs (request_key)
  where request_key is not null;

commit;
