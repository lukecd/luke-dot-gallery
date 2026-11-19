-- Garden Desk workflows are deliberately server-operated. These tables are
-- never available to anonymous or ordinary authenticated clients; every
-- mutation goes through an authorized Next.js route using the service key.

create type public.desk_delivery_status as enum (
  'draft',
  'queued',
  'sent',
  'failed',
  'cancelled'
);

create type public.desk_plant_job_status as enum (
  'queued',
  'generating',
  'awaiting_review',
  'approved',
  'sent',
  'failed',
  'cancelled'
);

create type public.desk_generated_asset_status as enum (
  'candidate',
  'approved',
  'rejected'
);

create table public.desk_email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  subject_template text not null,
  text_template text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint email_templates_key_not_blank check (btrim(template_key) <> ''),
  constraint email_templates_name_not_blank check (btrim(name) <> '')
);

create table public.desk_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.desk_people(id) on delete set null,
  submission_id uuid references public.desk_submissions(id) on delete set null,
  template_id uuid references public.desk_email_templates(id) on delete set null,
  delivery_kind text not null,
  recipient_email text not null,
  subject text not null,
  text_body text not null,
  status public.desk_delivery_status not null default 'draft',
  provider_message_id text,
  sent_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliveries_kind_not_blank check (btrim(delivery_kind) <> ''),
  constraint deliveries_email_normalized check (recipient_email = lower(btrim(recipient_email)))
);

create index desk_email_deliveries_submission_idx
  on public.desk_email_deliveries (submission_id, created_at desc);
create index desk_email_deliveries_status_idx
  on public.desk_email_deliveries (status, created_at asc);

create table public.desk_plant_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.desk_submissions(id) on delete cascade,
  requested_plant_name text not null,
  botanical_name text,
  container text not null default 'terracotta_pot',
  status public.desk_plant_job_status not null default 'queued',
  generated_at timestamptz,
  reviewed_at timestamptz,
  sent_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_jobs_name_not_blank check (btrim(requested_plant_name) <> ''),
  constraint plant_jobs_container_valid check (
    container in ('terracotta_pot', 'ground', 'hanging', 'seed_tray')
  )
);

create index desk_plant_generation_jobs_status_idx
  on public.desk_plant_generation_jobs (status, created_at asc);

create table public.desk_generated_plant_assets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.desk_plant_generation_jobs(id) on delete cascade,
  attempt integer not null,
  status public.desk_generated_asset_status not null default 'candidate',
  prompt text not null,
  model text not null,
  style_reference text not null default 'rosemary-v1',
  bucket_id text not null,
  storage_path text not null,
  content_type text not null default 'image/png',
  byte_size integer,
  created_at timestamptz not null default now(),
  constraint generated_plant_assets_attempt_positive check (attempt > 0),
  constraint generated_plant_assets_byte_size_positive check (byte_size is null or byte_size > 0),
  constraint generated_plant_assets_job_attempt_unique unique (job_id, attempt),
  constraint generated_plant_assets_storage_object_unique unique (bucket_id, storage_path)
);

create index desk_generated_plant_assets_job_idx
  on public.desk_generated_plant_assets (job_id, created_at desc);

create trigger email_templates_set_updated_at
before update on public.desk_email_templates
for each row execute function public.desk_set_updated_at();

create trigger email_deliveries_set_updated_at
before update on public.desk_email_deliveries
for each row execute function public.desk_set_updated_at();

create trigger plant_generation_jobs_set_updated_at
before update on public.desk_plant_generation_jobs
for each row execute function public.desk_set_updated_at();

alter table public.desk_email_templates enable row level security;
alter table public.desk_email_deliveries enable row level security;
alter table public.desk_plant_generation_jobs enable row level security;
alter table public.desk_generated_plant_assets enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'garden-desk-generated',
  'garden-desk-generated',
  false,
  6000000,
  array['image/png']
)
on conflict (id) do nothing;

insert into public.desk_email_templates (
  template_key,
  name,
  subject_template,
  text_template
)
values
  (
    'testflight-invitation-v1',
    'TestFlight invitation',
    'You’re invited to help shape Sow',
    E'Hi {first_name},\n\nThank you for raising your hand to try Sow. You are invited to our private TestFlight.\n\n{testflight_public_link}\n\nSow is still growing. If something feels unclear or breaks, reply to this email or use the feedback form in the app. Your notes will help shape what we make next.\n\n— Sow'
  ),
  (
    'plant-illustration-ready-v1',
    'Plant illustration ready',
    'Your {plant_name} illustration is ready for Sow',
    E'Hi {first_name},\n\nThank you for suggesting {plant_name}. We made a botanical plate for you and attached it here so you can add it to Sow now.\n\nWe will review it for a future Sow update. That takes a little time, but your suggestion is now part of the library we are growing.\n\n— Sow'
  )
on conflict (template_key) do nothing;

revoke all on table public.desk_email_templates, public.desk_email_deliveries,
  public.desk_plant_generation_jobs, public.desk_generated_plant_assets
  from anon, authenticated;

grant all on table public.desk_email_templates, public.desk_email_deliveries,
  public.desk_plant_generation_jobs, public.desk_generated_plant_assets
  to service_role;
