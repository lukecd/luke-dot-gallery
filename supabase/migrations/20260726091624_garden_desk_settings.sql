-- Non-secret operational settings that Luke edits in Garden Desk. Secrets
-- remain environment variables managed by Vercel and are never stored here.
create table public.desk_settings (
  setting_key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint desk_settings_key_not_blank check (btrim(setting_key) <> '')
);

create trigger settings_set_updated_at
before update on public.desk_settings
for each row execute function public.desk_set_updated_at();

alter table public.desk_settings enable row level security;
revoke all on table public.desk_settings from anon, authenticated;
grant all on table public.desk_settings to service_role;

insert into public.desk_settings (setting_key, value)
values ('testflight', '{"public_link": ""}'::jsonb)
on conflict (setting_key) do nothing;
