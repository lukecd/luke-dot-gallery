-- PROPOSAL ONLY: promote through the existing canonical Supabase migration
-- history in sow.garden-web after reviewing the linked database and testing.
-- This file is not a migration and must not be applied independently.
begin;
set local lock_timeout = '5s';

insert into public.desk_apps (slug, name)
values ('ramble-patch', 'Ramble Patch')
on conflict (slug) do nothing;

insert into public.desk_app_features (app_id, feature_key, enabled)
select id, feature_key, true from public.desk_apps
cross join (values ('mailing_lists'), ('feedback')) as feature(feature_key)
where slug = 'ramble-patch'
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
    join public.desk_app_features feedback on feedback.app_id = a.id and feedback.feature_key = 'feedback' and feedback.enabled
    join public.desk_mailing_lists l on l.app_id = a.id and l.slug = 'updates'
    where a.slug = 'ramble-patch' and a.name = 'Ramble Patch' and a.archived_at is null
      and l.name = 'Ramble Patch updates' and l.signup_enabled
      and l.consent_text = 'I’d like occasional updates about Ramble Patch and other apps by Luke Cassady-Dorion.'
      and l.consent_copy_version = 'ramble-patch-creator-updates-v1'
  ) then raise exception 'Existing Ramble Patch settings need review'; end if;
end $$;

-- New app messages are separate from the historical Sow-only inbox.
create table public.desk_app_messages (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.desk_apps(id) on delete restrict,
  person_id uuid not null references public.desk_people(id) on delete cascade,
  message text not null check (length(btrim(message)) between 1 and 5000),
  received_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'done'))
);
create index desk_app_messages_app_received_idx on public.desk_app_messages (app_id, received_at desc);
alter table public.desk_app_messages enable row level security;
revoke all on public.desk_app_messages from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.desk_app_messages to service_role;

-- A contact and its message either both succeed or both roll back. A blank
-- name never erases an existing name; messages never imply marketing consent.
create function public.desk_add_app_message(p_app_slug text, p_email text, p_name text, p_message text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare selected_app uuid; selected_person uuid; created_message uuid;
begin
  select a.id into selected_app from public.desk_apps a
  join public.desk_app_features f on f.app_id = a.id and f.feature_key = 'feedback' and f.enabled
  where a.slug = p_app_slug and a.archived_at is null;
  if not found then raise exception 'App unavailable' using errcode = '22023'; end if;
  if p_email is null or length(p_email) > 254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or length(coalesce(p_name, '')) > 100 or length(btrim(coalesce(p_message, ''))) not between 1 and 5000 then
    raise exception 'Invalid message' using errcode = '22023';
  end if;
  insert into public.desk_people (email, display_name, last_seen_at)
  values (lower(btrim(p_email)), nullif(btrim(p_name), ''), now())
  on conflict (email) do update set last_seen_at = excluded.last_seen_at
  returning id into selected_person;
  insert into public.desk_app_messages (app_id, person_id, message)
  values (selected_app, selected_person, btrim(p_message)) returning id into created_message;
  return created_message;
end;
$$;
revoke all on function public.desk_add_app_message(text,text,text,text) from public, anon, authenticated;
grant execute on function public.desk_add_app_message(text,text,text,text) to service_role;

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
