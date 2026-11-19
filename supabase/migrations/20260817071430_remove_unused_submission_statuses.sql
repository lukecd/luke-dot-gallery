-- Garden Desk has not launched. Keep its status model deliberately small before
-- application code begins to depend on redundant terminal states.
alter table public.desk_submissions
  alter column status drop default;

create type public.desk_submission_status_next as enum (
  'new',
  'reviewing',
  'planned',
  'in_progress',
  'done'
);

alter table public.desk_submissions
  alter column status type public.desk_submission_status_next
  using status::text::public.desk_submission_status_next;

drop type public.desk_submission_status;

alter type public.desk_submission_status_next
  rename to desk_submission_status;

alter table public.desk_submissions
  alter column status set default 'new'::public.desk_submission_status;
