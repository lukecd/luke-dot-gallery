-- Run against an isolated local database. All fixture writes roll back.
begin;
do $$
declare client_role text;
begin
  foreach client_role in array array['anon', 'authenticated'] loop
    if has_table_privilege(client_role, 'public.desk_app_messages', 'SELECT')
      or has_function_privilege(client_role, 'public.desk_add_app_message(text,text,text,text)', 'EXECUTE')
      then raise exception 'Unexpected client access: %', client_role; end if;
  end loop;
  if not has_table_privilege('service_role', 'public.desk_app_messages', 'SELECT,INSERT')
    or not has_function_privilege('service_role', 'public.desk_add_app_message(text,text,text,text)', 'EXECUTE')
    then raise exception 'Service access missing'; end if;
  if not (select relrowsecurity from pg_class where oid = 'public.desk_app_messages'::regclass)
    then raise exception 'RLS missing'; end if;
end $$;
set local role service_role;
select public.desk_add_app_message('ramble-patch', 'ramble-test@example.invalid', 'Original Name', 'First message');
select public.desk_add_app_message('ramble-patch', 'ramble-test@example.invalid', '', 'Second message');
do $$
begin
  if (select display_name from public.desk_people where email = 'ramble-test@example.invalid') <> 'Original Name'
    then raise exception 'Blank name overwrote existing name'; end if;
  if (select count(*) from public.desk_app_messages m join public.desk_people p on p.id = m.person_id
      join public.desk_apps a on a.id = m.app_id where p.email = 'ramble-test@example.invalid' and a.slug = 'ramble-patch') <> 2
    then raise exception 'Messages not scoped to Ramble'; end if;
  if exists (select 1 from public.desk_mailing_subscriptions s join public.desk_people p on p.id = s.person_id
      where p.email = 'ramble-test@example.invalid') then raise exception 'Contact created a subscription'; end if;
  begin
    perform public.desk_subscribe_with_creator_updates('ramble-patch', 'updates', 'ramble-test@example.invalid', null, 'test', 'wrong-version', null);
    raise exception 'Wrong consent version accepted';
  exception when sqlstate '22023' then null; end;
end $$;
select public.desk_subscribe_with_creator_updates('ramble-patch', 'updates', 'ramble-test@example.invalid', null, 'test', 'ramble-patch-creator-updates-v1', null);
do $$
begin
  if (select count(*) from public.desk_mailing_subscriptions s join public.desk_people p on p.id = s.person_id
      join public.desk_mailing_lists l on l.id = s.list_id join public.desk_apps a on a.id = l.app_id
      where p.email = 'ramble-test@example.invalid' and s.status = 'subscribed' and l.slug = 'updates'
        and a.slug in ('ramble-patch', 'sp-stories')) <> 2
    then raise exception 'Expected both consented memberships'; end if;
end $$;
rollback;
