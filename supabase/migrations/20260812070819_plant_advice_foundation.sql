-- Add the operation separately before a later migration uses its new enum value.
-- PostgreSQL does not allow a just-added enum value to appear in an index or
-- constraint until the transaction that added it has committed.
alter type sow_api.ai_operation add value if not exists 'plant_advice';
