-- Creator-wide updates, with separate app memberships and preserved history.
-- Luke requested the one-time existing-friend audience adjustment on 2026-09-27.
begin;
set local lock_timeout = '5s';

insert into public.desk_apps(slug, name) values ('sp-stories', 'Luke’s app updates');
insert into public.desk_app_features(app_id, feature_key, enabled)
select id, 'mailing_lists', true from public.desk_apps where slug = 'sp-stories';
insert into public.desk_mailing_lists(app_id, slug, name, consent_text, consent_copy_version, signup_enabled)
select id, 'updates', 'All app updates',
  'I’d like occasional updates about apps by Luke Cassady-Dorion.',
  'luke-app-updates-v1', true
from public.desk_apps where slug = 'sp-stories';

update public.desk_mailing_lists l set
  consent_text = 'I’d like occasional updates about Sow and other apps by Luke Cassady-Dorion.',
  consent_copy_version = 'sow-creator-updates-v1'
from public.desk_apps a where a.id = l.app_id and a.slug = 'sow' and l.slug = 'updates';
update public.desk_mailing_lists l set
  consent_text = 'I’d like beta invitations and occasional updates about Relaxation Station and other apps by Luke Cassady-Dorion.',
  consent_copy_version = 'relaxation-station-creator-updates-v1'
from public.desk_apps a where a.id = l.app_id and a.slug = 'relaxation-station' and l.slug = 'updates';

-- Do not rewrite prior consent records or pretend these people saw the new copy.
-- Only currently subscribed people are included; opt-outs are not reactivated.
-- The new record's source/version explicitly identifies an owner adjustment.
with eligible as (
  select distinct s.person_id from public.desk_mailing_subscriptions s
  join public.desk_mailing_lists l on l.id = s.list_id
  join public.desk_apps a on a.id = l.app_id
  where a.slug in ('sow', 'relaxation-station') and l.slug = 'updates' and s.status = 'subscribed'
), added as (
  insert into public.desk_mailing_subscriptions
    (list_id, person_id, status, source, consented_at, consent_copy_version)
  select l.id, e.person_id, 'subscribed', 'owner-scope-adjustment:2026-09-27', now(),
    'owner-directed-scope-adjustment-v1'
  from eligible e cross join public.desk_mailing_lists l
  join public.desk_apps a on a.id = l.app_id and a.slug = 'sp-stories'
  where l.slug = 'updates'
  returning id, status, source, consent_copy_version, consented_at
)
insert into public.desk_mailing_consent_events
  (subscription_id, status, source, consent_copy_version, occurred_at)
select id, status, source, consent_copy_version, consented_at from added;

-- Both memberships and both events succeed or roll back together. The existing
-- single-list RPC still performs app/feature/list/version/email validation.
create function public.desk_subscribe_with_creator_updates(
  p_app_slug text, p_list_slug text, p_email text, p_name text,
  p_source text, p_consent_copy_version text, p_submission_id uuid default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  subscription uuid;
begin
  subscription := public.desk_subscribe_to_list(
    p_app_slug, p_list_slug, p_email, p_name, p_source, p_consent_copy_version, p_submission_id
  );
  if p_list_slug = 'updates' and (
    (p_app_slug = 'sow' and p_consent_copy_version = 'sow-creator-updates-v1') or
    (p_app_slug = 'relaxation-station' and p_consent_copy_version = 'relaxation-station-creator-updates-v1')
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
