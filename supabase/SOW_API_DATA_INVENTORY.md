# Sow API private-data inventory

`sow_api` is a private Postgres schema for the server-only `sow.garden-api`
runtime. It is intentionally not exposed through Supabase's Data API. Browser
roles (`anon`, `authenticated`, and `service_role`) have no privileges on the
schema; only the separately provisioned `sow_api_runtime` role is intended to
access it over a direct server-only Postgres connection.

The direct connection URL belongs only in the API Vercel project as
`SOW_DATABASE_URL`. It must never be added to the website environment or an
iOS build.

| Category                            | Linkage                          | Purpose                                                           | Expected retention / cleanup                                                       | Access                                                 |
| ----------------------------------- | -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Account HMAC                        | Account-linked                   | Pseudonymous Apple-account lookup and entitlement ownership       | While the account is active; deletion policy is a future product decision          | API runtime                                            |
| Attested installation key/counter   | Installation-linked              | Verify App Attest assertions and prevent replay                   | While the installation is active; retain revocation history as needed for security | API runtime                                            |
| Challenge HMAC, expiry, consumption | Account- or installation-linked  | One-time Apple Sign in and App Attest verification                | Short-lived; expired challenges are eligible for later cleanup                     | API runtime                                            |
| Entitlement state                   | Account-linked                   | TestFlight/production trial and future StoreKit entitlement state | While needed to provide access and account history                                 | API runtime                                            |
| Completed-walk usage                | Account- and installation-linked | Count completed Garden Walks and measure actual provided duration | Retention policy to be set before public launch                                    | API runtime                                            |
| Daily rollups                       | Aggregate by environment         | Operational metrics and future Garden Desk reporting              | Retain while useful for product reporting                                          | API runtime; future server-side Garden Desk query only |

Paid release additions (`20261112064047_paid_access_isolation.sql`): `paid_trials`
contains account ID, sandbox/production partition, and trial start/end;
`paid_revenuecat_access` contains the same ownership/partition, grant status,
expiry, purchase-history flag, and last-check time. Both cascade on account
deletion and are private to the API runtime. `ai_operation_requests.access_policy`
preserves authorization policy across delayed uploads. No store receipts or
purchase payloads are stored here. See `docs/PAID_ACCESS_MIGRATION.md` for validation
and deployment ordering.

## Explicit exclusions

The schema does not store raw Apple identity subjects, identity tokens, names,
emails, device names, advertising IDs, IP addresses, precise location,
recordings, transcript text, photos, plant names, memory text, categories,
weather, garden details, or payment details.

The completed-walk record stores an HMAC of an opaque API operation identifier,
not a local walk identifier. It records a server completion timestamp and the
recorder's actual duration in seconds when available. A missing duration remains
unknown (`NULL`); the server must never estimate it from request or payload
size.

## Privacy-policy handoff

This document is an internal engineering inventory, not public privacy copy.
Account-linked completed-walk frequency and duration must be included in the
later unified review of the Sow privacy policy and App Store privacy answers,
alongside website comments, payments, analytics, and the final API surface.
