-- Add Ask audio transcription as a distinct operation before the following
-- migration uses it in constraints, indexes, and a trigger predicate.
-- PostgreSQL makes a newly added enum value usable only after this migration's
-- transaction commits.
alter type sow_api.ai_operation
  add value if not exists 'plant_advice_transcription';
