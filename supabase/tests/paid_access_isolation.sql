-- Read-only structural check; run after the canonical migration.
begin;
set local transaction read only;
do $$
declare
  table_name text;
  blocked_role text;
begin
  foreach table_name in array array['paid_trials', 'paid_revenuecat_access'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='sow_api' and c.relname=table_name and c.relrowsecurity) then
      raise exception 'Missing table or RLS: %', table_name;
    end if;
    foreach blocked_role in array array['anon','authenticated','service_role','garden_desk_analytics'] loop
      if has_schema_privilege(blocked_role,'sow_api','USAGE') or
         has_table_privilege(blocked_role,'sow_api.' || table_name,'SELECT,INSERT,UPDATE,DELETE') then
        raise exception 'Unexpected private-data privilege: % / %', blocked_role, table_name;
      end if;
    end loop;
    if not has_table_privilege('sow_api_runtime','sow_api.' || table_name,'SELECT') or
       not has_table_privilege('sow_api_runtime','sow_api.' || table_name,'INSERT') or
       not has_table_privilege('sow_api_runtime','sow_api.' || table_name,'UPDATE') or
       not has_table_privilege('sow_api_runtime','sow_api.' || table_name,'DELETE') then
      raise exception 'Missing runtime privilege: %', table_name;
    end if;
    if not exists (select 1 from pg_constraint where conrelid=('sow_api.' || table_name)::regclass
      and contype='f' and confrelid='sow_api.accounts'::regclass and confdeltype='c') then
      raise exception 'Missing account deletion cascade: %', table_name;
    end if;
  end loop;
  if not exists (select 1 from information_schema.columns c where c.table_schema='sow_api'
    and c.table_name='ai_operation_requests' and c.column_name='access_policy' and c.is_nullable='YES') then
    raise exception 'Missing nullable stored operation policy';
  end if;
end;
$$;
rollback;
