-- Keep the current subscriber state in desk_newsletter_subscriptions and an
-- append-only record of each affirmative consent. These tables remain private:
-- public visitors only submit through the validated Next.js route, and Garden
-- Desk reads them through authenticated server routes.

alter table public.desk_newsletter_subscriptions
  add column consent_copy_version text,
  add column source_submission_id uuid references public.desk_submissions(id) on delete set null;

update public.desk_newsletter_subscriptions
set consent_copy_version = 'legacy-unknown'
where consent_copy_version is null;

alter table public.desk_newsletter_subscriptions
  alter column consent_copy_version set default 'website-marketing-opt-in-v1',
  alter column consent_copy_version set not null;

create index desk_newsletter_subscriptions_source_submission_id_idx
  on public.desk_newsletter_subscriptions(source_submission_id)
  where source_submission_id is not null;

create table public.desk_newsletter_consent_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.desk_newsletter_subscriptions(id) on delete cascade,
  person_id uuid not null references public.desk_people(id) on delete cascade,
  status public.desk_subscription_status not null,
  source text not null,
  source_submission_id uuid references public.desk_submissions(id) on delete set null,
  consent_copy_version text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint newsletter_consent_events_source_not_blank check (btrim(source) <> ''),
  constraint newsletter_consent_events_copy_version_not_blank check (btrim(consent_copy_version) <> '')
);

create index desk_newsletter_consent_events_person_idx
  on public.desk_newsletter_consent_events(person_id, occurred_at desc);
create index desk_newsletter_consent_events_subscription_idx
  on public.desk_newsletter_consent_events(subscription_id, occurred_at desc);

alter table public.desk_newsletter_consent_events enable row level security;

revoke all on table public.desk_newsletter_consent_events from anon, authenticated;
grant all on table public.desk_newsletter_consent_events to service_role;
