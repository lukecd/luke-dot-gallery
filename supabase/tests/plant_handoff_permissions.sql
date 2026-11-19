-- Run after the permission migration. This exercises the server's exact
-- batch lookup/create/update permissions and leaves no test rows behind.
begin;
set local role service_role;
select id from public.desk_plant_app_handoff_batches where status = 'ready' limit 1;
insert into public.desk_plant_app_handoff_batches (id, status, job_count)
values ('ffffffff-ffff-4fff-afff-ffffffffffff', 'creating', 1);
update public.desk_plant_app_handoff_batches
set status = 'failed', last_error = 'Rollback-only permission verification'
where id = 'ffffffff-ffff-4fff-afff-ffffffffffff'
returning id, status;
rollback;
