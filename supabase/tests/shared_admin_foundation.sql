-- Read-only verification immediately after the foundation migration.
-- Run as the database owner with psql -v ON_ERROR_STOP=1 -f <this file>.
-- This checks configuration and grants, not a full application integration.
begin read only;

do $$
declare
  table_name text;
  role_name text;
  operation text;
begin
  if (
    select count(*) from public.desk_apps
    where (slug, name) in (
      ('sow', 'Sow'), ('relaxation-station', 'Relaxation Station')
    ) and archived_at is null
  ) <> 2 then
    raise exception 'Expected both active app registrations';
  end if;

  if (
    select array_agg(feature.feature_key order by feature.feature_key)
    from public.desk_app_features feature
    join public.desk_apps app on app.id = feature.app_id
    where app.slug = 'sow' and feature.enabled
  ) is distinct from array[
    'analytics', 'feedback', 'mailing_lists', 'plant_illustrations', 'testflight'
  ]::text[] then
    raise exception 'Unexpected Sow feature configuration';
  end if;

  if (
    select array_agg(feature.feature_key order by feature.feature_key)
    from public.desk_app_features feature
    join public.desk_apps app on app.id = feature.app_id
    where app.slug = 'relaxation-station' and feature.enabled
  ) is distinct from array['mailing_lists']::text[] then
    raise exception 'Relaxation Station should enable only mailing lists';
  end if;

  foreach table_name in array array['desk_apps', 'desk_app_features'] loop
    if not (
      select relrowsecurity from pg_class
      where oid = format('public.%I', table_name)::regclass
    ) then
      raise exception 'RLS is disabled on %', table_name;
    end if;

    if exists (
      select 1 from pg_policy
      where polrelid = format('public.%I', table_name)::regclass
    ) then
      raise exception 'Unexpected client-access policy on %', table_name;
    end if;

    -- Include the mobile and reporting roles if present. These are existing
    -- roles; the migration neither creates nor modifies them.
    for role_name in
      select rolname from pg_roles
      where rolname in ('anon', 'authenticated', 'sow_api_runtime', 'garden_desk_analytics')
    loop
      foreach operation in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
        if has_table_privilege(role_name, format('public.%I', table_name), operation) then
          raise exception 'Unexpected % permission for % on %', operation, role_name, table_name;
        end if;
      end loop;
    end loop;

    foreach operation in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
      if not has_table_privilege('service_role', format('public.%I', table_name), operation) then
        raise exception 'Missing server % permission on %', operation, table_name;
      end if;
    end loop;
  end loop;
end;
$$;

select app.slug, feature.feature_key, feature.enabled
from public.desk_apps app
join public.desk_app_features feature on feature.app_id = app.id
order by app.slug, feature.feature_key;

rollback;
