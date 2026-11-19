-- Read-only verification; run alongside shared_admin_mailing_lists.sql, which
-- checks that all original Sow records and consent events still match exactly.
begin transaction isolation level repeatable read read only;
do $$
declare
  client_role text;
begin
  if (select count(*) from public.desk_mailing_lists l
      join public.desk_apps a on a.id = l.app_id
      where l.slug = 'updates' and l.signup_enabled and (
        (a.slug = 'sow' and l.consent_copy_version = 'sow-creator-updates-v1') or
        (a.slug = 'relaxation-station' and l.consent_copy_version = 'relaxation-station-creator-updates-v1') or
        (a.slug = 'sp-stories' and l.consent_copy_version = 'luke-app-updates-v1')
      )) <> 3 then raise exception 'Creator consent configuration mismatch'; end if;
  if not exists (select 1 from public.desk_app_features f join public.desk_apps a on a.id = f.app_id
      where a.slug = 'sp-stories' and a.archived_at is null and f.feature_key = 'mailing_lists' and f.enabled)
    then raise exception 'Creator audience unavailable'; end if;
  foreach client_role in array array['anon', 'authenticated'] loop
    if has_function_privilege(client_role, 'public.desk_subscribe_with_creator_updates(text,text,text,text,text,text,uuid)', 'EXECUTE')
      then raise exception 'Client RPC access: %', client_role; end if;
  end loop;
  if not has_function_privilege('service_role', 'public.desk_subscribe_with_creator_updates(text,text,text,text,text,text,uuid)', 'EXECUTE')
    then raise exception 'Service RPC access missing'; end if;
  if exists (select 1 from pg_proc where oid = 'public.desk_subscribe_with_creator_updates(text,text,text,text,text,text,uuid)'::regprocedure and prosecdef)
    then raise exception 'Unexpected definer privileges'; end if;
  if exists (
    select 1 from public.desk_mailing_consent_events e
    join public.desk_mailing_subscriptions s on s.id = e.subscription_id
    join public.desk_mailing_lists l on l.id = s.list_id
    join public.desk_apps a on a.id = l.app_id
    where e.source = 'owner-scope-adjustment:2026-09-27' and
      (a.slug <> 'sp-stories' or e.consent_copy_version <> 'owner-directed-scope-adjustment-v1')
  ) then raise exception 'Owner adjustment incorrectly attributed'; end if;
end;
$$;
select a.slug, l.consent_copy_version, count(s.id) as memberships
from public.desk_apps a join public.desk_mailing_lists l on l.app_id = a.id
left join public.desk_mailing_subscriptions s on s.list_id = l.id
group by a.slug, l.consent_copy_version order by a.slug;
rollback;
