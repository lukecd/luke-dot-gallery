-- Read-only post-migration verification. Run as the database owner.
-- No fixtures, emails, or application data are written.
begin transaction isolation level repeatable read read only;
do $$
declare
  relation text;
  client_role text;
  permission text;
begin
  if (select count(*) from public.desk_mailing_lists l join public.desk_apps a on a.id = l.app_id
      where a.slug in ('sow', 'relaxation-station') and l.slug = 'updates') <> 2 then
    raise exception 'Missing initial mailing lists';
  end if;
  if exists (
    select 1 from public.desk_newsletter_subscriptions old
    left join public.desk_mailing_subscriptions new on new.id = old.id
    left join public.desk_mailing_lists l on l.id = new.list_id
    left join public.desk_apps a on a.id = l.app_id
    where new.id is null or a.slug is distinct from 'sow' or l.slug is distinct from 'updates'
      or row(old.person_id, old.status, old.source, old.consented_at, old.unsubscribed_at, old.consent_copy_version, old.source_submission_id, old.created_at, old.updated_at)
        is distinct from row(new.person_id, new.status, new.source, new.consented_at, new.unsubscribed_at, new.consent_copy_version, new.source_submission_id, new.created_at, new.updated_at)
  ) then raise exception 'Sow subscription backfill or bridge mismatch'; end if;
  if exists (
    select 1 from public.desk_newsletter_consent_events old
    left join public.desk_mailing_consent_events new on new.id = old.id
    where new.id is null or row(old.subscription_id, old.status, old.source, old.consent_copy_version, old.source_submission_id, old.occurred_at, old.created_at)
      is distinct from row(new.subscription_id, new.status, new.source, new.consent_copy_version, new.source_submission_id, new.occurred_at, new.created_at)
  ) then raise exception 'Sow consent history mismatch'; end if;
  foreach relation in array array['desk_mailing_lists', 'desk_mailing_subscriptions', 'desk_mailing_consent_events'] loop
    if not (select relrowsecurity from pg_class where oid = ('public.' || relation)::regclass) then raise exception 'RLS missing: %', relation; end if;
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = relation) then raise exception 'Unexpected policy: %', relation; end if;
    foreach permission in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
      if not has_table_privilege('service_role', 'public.' || relation, permission) then raise exception 'Service access missing: % %', relation, permission; end if;
    end loop;
    foreach client_role in array array['anon', 'authenticated'] loop
      if has_table_privilege(client_role, 'public.' || relation, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'Client table access: % %', client_role, relation; end if;
    end loop;
  end loop;
  foreach client_role in array array['anon', 'authenticated'] loop
    if has_function_privilege(client_role, 'public.desk_subscribe_to_list(text,text,text,text,text,text,uuid)', 'EXECUTE')
      or has_function_privilege(client_role, 'public.desk_unsubscribe_from_list(text,uuid)', 'EXECUTE') then
      raise exception 'Client RPC access: %', client_role;
    end if;
  end loop;
  if (select count(*) from pg_trigger where tgname in ('desk_mirror_sow_subscription', 'desk_mirror_sow_consent') and tgenabled = 'O') <> 2 then raise exception 'Compatibility triggers missing or disabled'; end if;
end;
$$;
select a.slug as app, l.slug as list, count(s.id) as subscriptions,
  count(s.id) filter (where s.status = 'subscribed') as subscribed
from public.desk_apps a join public.desk_mailing_lists l on l.app_id = a.id
left join public.desk_mailing_subscriptions s on s.list_id = l.id
group by a.slug, l.slug order by a.slug, l.slug;
rollback;
