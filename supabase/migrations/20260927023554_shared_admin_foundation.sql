-- Additive registry for the shared admin, installed before the new website.
-- No existing data, mobile schemas, or permissions are changed.
begin;

create table public.desk_apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint desk_apps_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint desk_apps_name_not_blank check (btrim(name) <> '')
);

create table public.desk_app_features (
  app_id uuid not null references public.desk_apps(id) on delete restrict,
  feature_key text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (app_id, feature_key),
  constraint desk_app_features_known_key check (
    feature_key in (
      'mailing_lists',
      'feedback',
      'testflight',
      'plant_illustrations',
      'analytics'
    )
  )
);

-- The primary key also indexes feature lookups by app_id.
-- Reuse the existing timestamp trigger without changing its implementation.
create trigger desk_apps_set_updated_at
before update on public.desk_apps
for each row execute function public.desk_set_updated_at();

create trigger desk_app_features_set_updated_at
before update on public.desk_app_features
for each row execute function public.desk_set_updated_at();

-- Same server-only access boundary as the existing Garden Desk tables.
-- Feature configuration is not an authorization policy for app customers.
alter table public.desk_apps enable row level security;
alter table public.desk_app_features enable row level security;

revoke all on table public.desk_apps, public.desk_app_features
  from public, anon, authenticated, service_role;
grant select, insert, update, delete
  on table public.desk_apps, public.desk_app_features to service_role;

insert into public.desk_apps (slug, name)
values ('sow', 'Sow'), ('relaxation-station', 'Relaxation Station');

-- The new admin reads these module settings after application deployment.
-- These rows do not change mobile functionality or authorize campaign sending.
insert into public.desk_app_features (app_id, feature_key, enabled)
select app.id, feature.feature_key, true
from public.desk_apps app
cross join (
  values ('mailing_lists'), ('feedback'), ('testflight'),
    ('plant_illustrations'), ('analytics')
) as feature(feature_key)
where app.slug = 'sow';

insert into public.desk_app_features (app_id, feature_key, enabled)
select id, 'mailing_lists', true
from public.desk_apps
where slug = 'relaxation-station';

commit;
