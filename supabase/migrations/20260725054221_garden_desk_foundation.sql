-- Garden Desk is deliberately private. Public forms enter through the Next.js
-- server, which validates input and uses the server-only Supabase secret.
-- No public Data API policies are created for these tables. The tables use the
-- public schema so the server client can use Supabase's Data API, but explicit
-- privileges and RLS keep them unavailable to anonymous visitors.

create type public.desk_submission_kind as enum (
  'feedback',
  'feature_request',
  'bug_report',
  'plant_suggestion',
  'testflight_invitation'
);

create type public.desk_submission_status as enum (
  'new',
  'reviewing',
  'planned',
  'in_progress',
  'resolved',
  'closed'
);

create type public.desk_subscription_status as enum (
  'subscribed',
  'unsubscribed'
);

create type public.desk_testflight_status as enum (
  'requested',
  'invited',
  'accepted',
  'closed'
);

create table public.desk_people (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_email_normalized check (email = lower(btrim(email))),
  constraint people_email_unique unique (email)
);

create table public.desk_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_unique unique (name),
  constraint categories_sort_order_nonnegative check (sort_order >= 0)
);

create table public.desk_submissions (
  id uuid primary key default gen_random_uuid(),
  public_id bigint generated always as identity unique,
  kind public.desk_submission_kind not null,
  status public.desk_submission_status not null default 'new',
  person_id uuid not null references public.desk_people(id) on delete restrict,
  title text,
  message text,
  device text,
  location text,
  plant_name text,
  growing_region text,
  source text not null default 'website',
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_source_not_blank check (btrim(source) <> '')
);

create index desk_submissions_received_at_idx on public.desk_submissions (received_at desc);
create index desk_submissions_kind_status_idx on public.desk_submissions (kind, status, received_at desc);
create index desk_submissions_person_id_idx on public.desk_submissions (person_id);

create table public.desk_submission_categories (
  submission_id uuid not null references public.desk_submissions(id) on delete cascade,
  category_id uuid not null references public.desk_categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (submission_id, category_id)
);

create table public.desk_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.desk_submissions(id) on delete cascade,
  bucket_id text not null,
  storage_path text not null,
  original_filename text,
  content_type text,
  byte_size integer,
  created_at timestamptz not null default now(),
  constraint attachments_byte_size_positive check (byte_size is null or byte_size > 0),
  constraint attachments_storage_object_unique unique (bucket_id, storage_path)
);

create table public.desk_newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.desk_people(id) on delete cascade,
  status public.desk_subscription_status not null default 'subscribed',
  source text not null,
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_person_unique unique (person_id),
  constraint newsletter_source_not_blank check (btrim(source) <> '')
);

create table public.desk_testflight_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.desk_submissions(id) on delete cascade,
  status public.desk_testflight_status not null default 'requested',
  device text not null,
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testflight_submission_unique unique (submission_id)
);

create table public.desk_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  constraint admin_profiles_role check (role in ('owner', 'editor', 'viewer'))
);

create table public.desk_activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_entity_type_not_blank check (btrim(entity_type) <> ''),
  constraint activity_action_not_blank check (btrim(action) <> '')
);

create index desk_activity_log_entity_idx on public.desk_activity_log (entity_type, entity_id, created_at desc);

create or replace function public.desk_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.desk_set_updated_at() from public;

create trigger people_set_updated_at
before update on public.desk_people
for each row execute function public.desk_set_updated_at();

create trigger categories_set_updated_at
before update on public.desk_categories
for each row execute function public.desk_set_updated_at();

create trigger submissions_set_updated_at
before update on public.desk_submissions
for each row execute function public.desk_set_updated_at();

create trigger newsletter_subscriptions_set_updated_at
before update on public.desk_newsletter_subscriptions
for each row execute function public.desk_set_updated_at();

create trigger testflight_requests_set_updated_at
before update on public.desk_testflight_requests
for each row execute function public.desk_set_updated_at();

alter table public.desk_people enable row level security;
alter table public.desk_categories enable row level security;
alter table public.desk_submissions enable row level security;
alter table public.desk_submission_categories enable row level security;
alter table public.desk_attachments enable row level security;
alter table public.desk_newsletter_subscriptions enable row level security;
alter table public.desk_testflight_requests enable row level security;
alter table public.desk_admin_profiles enable row level security;
alter table public.desk_activity_log enable row level security;

-- This bucket is private. Files are uploaded only by the server and later
-- downloaded for authenticated administrators through signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'garden-desk-uploads',
  'garden-desk-uploads',
  false,
  600000,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

revoke all on table public.desk_people, public.desk_categories, public.desk_submissions,
  public.desk_submission_categories, public.desk_attachments,
  public.desk_newsletter_subscriptions, public.desk_testflight_requests,
  public.desk_admin_profiles, public.desk_activity_log from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on function public.desk_set_updated_at() from anon, authenticated;

grant all on table public.desk_people, public.desk_categories, public.desk_submissions,
  public.desk_submission_categories, public.desk_attachments,
  public.desk_newsletter_subscriptions, public.desk_testflight_requests,
  public.desk_admin_profiles, public.desk_activity_log to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
