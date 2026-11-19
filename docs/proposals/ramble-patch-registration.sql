-- PROPOSAL ONLY: promote through the existing canonical Supabase migration
-- history in sow.garden-web after reviewing the linked database and testing.
-- This file is not a migration and must not be applied independently.
begin;
set local lock_timeout = '5s';

insert into public.desk_apps (slug, name)
values ('ramble-patch', 'Ramble Patch')
on conflict (slug) do nothing;

insert into public.desk_app_features (app_id, feature_key, enabled)
select id, 'mailing_lists', true from public.desk_apps where slug = 'ramble-patch'
on conflict (app_id, feature_key) do nothing;

insert into public.desk_mailing_lists (app_id, slug, name, consent_text, consent_copy_version, signup_enabled)
select id, 'updates', 'Ramble Patch updates',
  'I’d like occasional updates about Ramble Patch and other apps by Luke Cassady-Dorion.',
  'ramble-patch-creator-updates-v1', true
from public.desk_apps where slug = 'ramble-patch'
on conflict (app_id, slug) do nothing;

-- Refuse to silently replace a pre-existing app or change its consent language.
do $$
begin
  if not exists (
    select 1 from public.desk_apps a
    join public.desk_app_features f on f.app_id = a.id and f.feature_key = 'mailing_lists' and f.enabled
    join public.desk_mailing_lists l on l.app_id = a.id and l.slug = 'updates'
    where a.slug = 'ramble-patch' and a.name = 'Ramble Patch' and a.archived_at is null
      and l.name = 'Ramble Patch updates' and l.signup_enabled
      and l.consent_text = 'I’d like occasional updates about Ramble Patch and other apps by Luke Cassady-Dorion.'
      and l.consent_copy_version = 'ramble-patch-creator-updates-v1'
  ) then raise exception 'Existing Ramble Patch settings need review'; end if;
end $$;

-- App membership and creator-wide membership must be recorded atomically.
create or replace function public.desk_subscribe_with_creator_updates(
  p_app_slug text, p_list_slug text, p_email text, p_name text,
  p_source text, p_consent_copy_version text, p_submission_id uuid default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare subscription uuid;
begin
  subscription := public.desk_subscribe_to_list(
    p_app_slug, p_list_slug, p_email, p_name, p_source, p_consent_copy_version, p_submission_id
  );
  if p_list_slug = 'updates' and (
    (p_app_slug = 'sow' and p_consent_copy_version = 'sow-creator-updates-v1') or
    (p_app_slug = 'relaxation-station' and p_consent_copy_version = 'relaxation-station-creator-updates-v1') or
    (p_app_slug = 'ramble-patch' and p_consent_copy_version = 'ramble-patch-creator-updates-v1')
  ) then
    perform public.desk_subscribe_to_list(
      'sp-stories', 'updates', p_email, p_name, p_source || ':' || p_app_slug,
      'luke-app-updates-v1', null
    );
  end if;
  return subscription;
end;
$$;
revoke all on function public.desk_subscribe_with_creator_updates(text,text,text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.desk_subscribe_with_creator_updates(text,text,text,text,text,text,uuid) to service_role;
commit;
