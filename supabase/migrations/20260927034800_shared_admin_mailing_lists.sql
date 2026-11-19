-- Expand without changing the legacy Sow writer's unique(person_id) contract.
-- Deploy this migration before the new application. Both versions can then run.
begin;
set local lock_timeout = '5s';

create table public.desk_mailing_lists (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.desk_apps(id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (btrim(name) <> ''),
  consent_text text not null check (btrim(consent_text) <> ''),
  consent_copy_version text not null check (btrim(consent_copy_version) <> ''),
  signup_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (app_id, slug)
);

create table public.desk_mailing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.desk_mailing_lists(id) on delete restrict,
  person_id uuid not null references public.desk_people(id) on delete cascade,
  status public.desk_subscription_status not null,
  source text not null check (btrim(source) <> ''),
  consented_at timestamptz not null,
  unsubscribed_at timestamptz,
  consent_copy_version text not null,
  source_submission_id uuid references public.desk_submissions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (list_id, person_id)
);
create index desk_mailing_subscriptions_person_idx on public.desk_mailing_subscriptions(person_id);
create index desk_mailing_subscriptions_list_date_idx on public.desk_mailing_subscriptions(list_id, consented_at desc, id);

create table public.desk_mailing_consent_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.desk_mailing_subscriptions(id) on delete cascade,
  status public.desk_subscription_status not null,
  source text not null,
  consent_copy_version text not null,
  source_submission_id uuid references public.desk_submissions(id) on delete set null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index desk_mailing_consent_events_subscription_idx on public.desk_mailing_consent_events(subscription_id, occurred_at desc);

alter table public.desk_mailing_lists enable row level security;
alter table public.desk_mailing_subscriptions enable row level security;
alter table public.desk_mailing_consent_events enable row level security;
revoke all on public.desk_mailing_lists, public.desk_mailing_subscriptions, public.desk_mailing_consent_events from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.desk_mailing_lists, public.desk_mailing_subscriptions, public.desk_mailing_consent_events to service_role;

insert into public.desk_mailing_lists(app_id, slug, name, consent_text, consent_copy_version, signup_enabled)
select id, 'updates', 'Garden Letter', 'I would like occasional news and product updates from Sow.', 'website-marketing-opt-in-v1', true
from public.desk_apps where slug = 'sow';

insert into public.desk_mailing_lists(app_id, slug, name, consent_text, consent_copy_version, signup_enabled)
select id, 'updates', 'Relaxation Station updates',
  'I would like beta invitations and occasional product updates from Relaxation Station.',
  'relaxation-station-updates-v1', true
from public.desk_apps where slug = 'relaxation-station';

-- Lock only the legacy mailing tables while copying and installing the bridge.
-- A busy table aborts after five seconds rather than waiting indefinitely.
lock table public.desk_newsletter_subscriptions, public.desk_newsletter_consent_events in share row exclusive mode;

insert into public.desk_mailing_subscriptions
  (id, list_id, person_id, status, source, consented_at, unsubscribed_at, consent_copy_version, source_submission_id, created_at, updated_at)
select s.id, l.id, s.person_id, s.status, s.source, s.consented_at, s.unsubscribed_at, s.consent_copy_version, s.source_submission_id, s.created_at, s.updated_at
from public.desk_newsletter_subscriptions s
cross join public.desk_mailing_lists l
join public.desk_apps a on a.id = l.app_id and a.slug = 'sow'
where l.slug = 'updates';

insert into public.desk_mailing_consent_events
  (id, subscription_id, status, source, consent_copy_version, source_submission_id, occurred_at, created_at)
select id, subscription_id, status, source, consent_copy_version, source_submission_id, occurred_at, created_at
from public.desk_newsletter_consent_events;

-- One-way compatibility bridge. Sow updates continue to write the legacy
-- tables until a later retirement migration. Other lists use the new tables.
create function public.desk_mirror_sow_subscription() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'DELETE' then
    delete from public.desk_mailing_subscriptions where id = OLD.id;
    return OLD;
  end if;
  insert into public.desk_mailing_subscriptions
    (id, list_id, person_id, status, source, consented_at, unsubscribed_at, consent_copy_version, source_submission_id, created_at, updated_at)
  select NEW.id, l.id, NEW.person_id, NEW.status, NEW.source, NEW.consented_at, NEW.unsubscribed_at, NEW.consent_copy_version, NEW.source_submission_id, NEW.created_at, NEW.updated_at
  from public.desk_mailing_lists l join public.desk_apps a on a.id = l.app_id
  where a.slug = 'sow' and l.slug = 'updates'
  on conflict (id) do update set
    status = excluded.status, source = excluded.source, consented_at = excluded.consented_at,
    unsubscribed_at = excluded.unsubscribed_at, consent_copy_version = excluded.consent_copy_version,
    source_submission_id = excluded.source_submission_id, updated_at = excluded.updated_at;
  if not found then raise exception 'Sow mailing list is missing'; end if;
  return NEW;
end;
$$;
create function public.desk_mirror_sow_consent() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.desk_mailing_consent_events
    (id, subscription_id, status, source, consent_copy_version, source_submission_id, occurred_at, created_at)
  values (NEW.id, NEW.subscription_id, NEW.status, NEW.source, NEW.consent_copy_version, NEW.source_submission_id, NEW.occurred_at, NEW.created_at);
  return NEW;
end;
$$;
revoke all on function public.desk_mirror_sow_subscription(), public.desk_mirror_sow_consent() from public, anon, authenticated;
create trigger desk_mirror_sow_subscription after insert or update or delete on public.desk_newsletter_subscriptions
for each row execute function public.desk_mirror_sow_subscription();
create trigger desk_mirror_sow_consent after insert on public.desk_newsletter_consent_events
for each row execute function public.desk_mirror_sow_consent();

-- Atomic subscription + consent event. Only authenticated server routes can
-- invoke this; website visitors never receive database credentials.
create function public.desk_subscribe_to_list(
  p_app_slug text, p_list_slug text, p_email text, p_name text,
  p_source text, p_consent_copy_version text, p_submission_id uuid default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  selected_list public.desk_mailing_lists;
  person uuid;
  subscription uuid;
  occurred timestamptz := now();
begin
  select l.* into selected_list from public.desk_mailing_lists l
  join public.desk_apps a on a.id = l.app_id
  join public.desk_app_features f on f.app_id = a.id and f.feature_key = 'mailing_lists' and f.enabled
  where a.slug = p_app_slug and a.archived_at is null and l.slug = p_list_slug and l.signup_enabled;
  if not found then raise exception 'Mailing list unavailable' using errcode = '22023'; end if;
  if p_consent_copy_version is distinct from selected_list.consent_copy_version then
    raise exception 'Signup wording changed; reload the form' using errcode = '22023';
  end if;
  if p_email is null or length(p_email) > 254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_source is null or btrim(p_source) = '' then
    raise exception 'Invalid signup' using errcode = '22023';
  end if;
  -- Submissions currently belong exclusively to Sow. Do not attach another
  -- app's consent to an unrelated support request.
  if p_submission_id is not null and (p_app_slug <> 'sow' or not exists (
    select 1 from public.desk_submissions s join public.desk_people p on p.id = s.person_id
    where s.id = p_submission_id and p.email = lower(btrim(p_email))
  )) then raise exception 'Invalid source submission' using errcode = '22023'; end if;

  insert into public.desk_people(email, display_name, last_seen_at)
  values (lower(btrim(p_email)), nullif(btrim(p_name), ''), occurred)
  on conflict (email) do update set last_seen_at = excluded.last_seen_at
  returning id into person;

  if p_app_slug = 'sow' and p_list_slug = 'updates' then
    insert into public.desk_newsletter_subscriptions
      (person_id, status, source, consented_at, unsubscribed_at, consent_copy_version, source_submission_id)
    values (person, 'subscribed', p_source, occurred, null, p_consent_copy_version, p_submission_id)
    on conflict (person_id) do update set status = 'subscribed', source = excluded.source,
      consented_at = excluded.consented_at, unsubscribed_at = null,
      consent_copy_version = excluded.consent_copy_version, source_submission_id = excluded.source_submission_id
    returning id into subscription;
    insert into public.desk_newsletter_consent_events
      (subscription_id, person_id, status, source, consent_copy_version, source_submission_id, occurred_at)
    values (subscription, person, 'subscribed', p_source, p_consent_copy_version, p_submission_id, occurred);
  else
    insert into public.desk_mailing_subscriptions
      (list_id, person_id, status, source, consented_at, consent_copy_version, source_submission_id)
    values (selected_list.id, person, 'subscribed', p_source, occurred, p_consent_copy_version, p_submission_id)
    on conflict (list_id, person_id) do update set status = 'subscribed', source = excluded.source,
      consented_at = excluded.consented_at, unsubscribed_at = null, updated_at = occurred,
      consent_copy_version = excluded.consent_copy_version, source_submission_id = excluded.source_submission_id
    returning id into subscription;
    insert into public.desk_mailing_consent_events
      (subscription_id, status, source, consent_copy_version, source_submission_id, occurred_at)
    values (subscription, 'subscribed', p_source, p_consent_copy_version, p_submission_id, occurred);
  end if;
  return subscription;
end;
$$;
revoke all on function public.desk_subscribe_to_list(text, text, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.desk_subscribe_to_list(text, text, text, text, text, text, uuid) to service_role;

create function public.desk_unsubscribe_from_list(p_app_slug text, p_subscription_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  subscription public.desk_mailing_subscriptions;
  list_slug text;
begin
  select s.* into subscription from public.desk_mailing_subscriptions s
  join public.desk_mailing_lists l on l.id = s.list_id
  join public.desk_apps a on a.id = l.app_id
  where s.id = p_subscription_id and a.slug = p_app_slug;
  if not found then raise exception 'Subscription not found' using errcode = '22023'; end if;
  select slug into list_slug from public.desk_mailing_lists where id = subscription.list_id;
  -- Unsubscribing remains possible even for archived apps or disabled features.
  if p_app_slug = 'sow' and list_slug = 'updates' then
    select status, consent_copy_version into subscription.status, subscription.consent_copy_version from public.desk_newsletter_subscriptions where id = subscription.id for update;
    if not found then raise exception 'Subscription not found' using errcode = '22023'; end if;
    if subscription.status = 'unsubscribed' then return; end if;
    update public.desk_newsletter_subscriptions set status = 'unsubscribed', unsubscribed_at = now()
    where id = subscription.id;
    insert into public.desk_newsletter_consent_events
      (subscription_id, person_id, status, source, consent_copy_version, occurred_at)
    values (subscription.id, subscription.person_id, 'unsubscribed', 'admin', subscription.consent_copy_version, now());
  else
    select status, consent_copy_version into subscription.status, subscription.consent_copy_version from public.desk_mailing_subscriptions where id = subscription.id for update;
    if not found then raise exception 'Subscription not found' using errcode = '22023'; end if;
    if subscription.status = 'unsubscribed' then return; end if;
    update public.desk_mailing_subscriptions set status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
    where id = subscription.id;
    insert into public.desk_mailing_consent_events(subscription_id, status, source, consent_copy_version, occurred_at)
    values (subscription.id, 'unsubscribed', 'admin', subscription.consent_copy_version, now());
  end if;
end;
$$;
revoke all on function public.desk_unsubscribe_from_list(text, uuid) from public, anon, authenticated;
grant execute on function public.desk_unsubscribe_from_list(text, uuid) to service_role;
commit;
