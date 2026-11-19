-- Support verified lifetime App Store gifts in the RevenueCat access mirror.
-- Apply before deploying the API lifetime parser. Existing grants and RLS stay intact.
begin;
alter table sow_api.revenuecat_access
  drop constraint revenuecat_access_status_check,
  alter column ends_at drop not null,
  add constraint revenuecat_access_status_check
    check (status in ('active_monthly', 'active_annual', 'active_lifetime', 'grace_period', 'expired')),
  add constraint revenuecat_access_expiration_check
    check ((status = 'active_lifetime' and ends_at is null and has_purchase)
      or (status <> 'active_lifetime' and ends_at is not null));
commit;
