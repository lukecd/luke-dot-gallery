begin;

-- Garden Desk creates and updates app handoff batches from server-side code.
-- RLS bypass does not confer table privileges; grant only the operations used.
grant select, insert, update on table public.desk_plant_app_handoff_batches to service_role;

commit;
