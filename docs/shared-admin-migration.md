# Shared app admin: environment and cutover

The admin is being moved from `sow.garden-web`; the existing service remains the live writer until cutover. Copy values through the deployment provider's secret settings, never into Git or a PR. Do not enable a second plant-generation schedule while the old worker runs. The existing books refresh schedule remains in `vercel.json`.

## Variables shown in the Sow deployment

| Variable | Purpose in this repository | Setup |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for admin auth and data | Required |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase auth key | Required |
| `SUPABASE_SECRET_KEY` | Server-only admin database and storage access | Required; this key bypasses RLS |
| `SOW_ADMIN_EMAIL` | Only permitted admin email | Required |
| `RESEND_API_KEY` | Admin sign-in links and workflow emails; also portfolio contact | Required for email |
| `CONTACT_FROM_EMAIL` | Verified Resend sender; also portfolio contact sender | Required for email; choose a sender verified for SP Stories |
| `CONTACT_REPLY_TO` | Reply destination for admin workflow emails | Optional; use the configured support alias when ready |
| `SOW_ANALYTICS_DATABASE_URL` | Read-only connection to Sow's aggregated analytics | Optional for analytics; use the restricted analytics role |
| `OPENAI_API_KEY` | Plant illustration generation | Required only for plant generation |
| `SOW_APP_GITHUB_TOKEN` | Creates illustration handoff PRs in the Sow app | Required only for handoff; verify expiry and regenerate if needed, with access limited to that repository |
| `CRON_SECRET` | Authorizes scheduled jobs; shared with the existing books refresh | Required to run scheduled jobs; ensure the same secret reaches both endpoints |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Luke.gallery's Google Analytics measurement ID, not an admin setting | Configure the Luke.gallery ID for Production; the Sow site's ID belongs to its own deployment |

Optional `SOW_APP_GITHUB_REPOSITORY` and `SOW_APP_GITHUB_BASE_BRANCH` override defaults (`lukecd/sow.garden-app` and `main`). `BLOB_READ_WRITE_TOKEN` is an existing portfolio requirement for hosted book discovery refreshes; it is not part of the Sow screenshot. Vercel-provided system variables are supplied by the platform. `ADMIN_SECRET`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, and `NEXT_PUBLIC_APP_STORE_URL` from the old example file are not required for this imported admin's runtime.

A preview pointed at the production Supabase project can read and modify real contacts and can send real emails or create real PRs. Use an isolated project and non-production credentials for write tests. Configure the destination's Supabase auth redirect URL for `/auth/callback` and verify login and MFA before changing any live URLs. No secrets have been copied or tested in this change.

The authoritative history of the shared Supabase database remains `sow.garden-web/supabase/migrations`, including the Sow API's migrations. Do not start a second migration history or archive that repository until ownership and the exact recorded history have been transferred and verified. No schema change is part of this import.

The shared mailing signup endpoint is `/api/mailing-lists/[app]/[list]/subscribe`; allowed external origins are in `admin-lib/mailing-signup-origins.ts`. Existing forms still point to the old deployment until deliberately changed. The `/api/contact` route preserves the portfolio JSON form and also accepts the Sow multipart relay. Verify delivery before setting `SOW_ADMIN_ORIGIN=https://luke.gallery` in the Sow website deployment.

Ramble Patch has a contact endpoint at `/api/contact/ramble-patch` and an admin messages view. Its registration, message storage, and creator-wide consent still need the proposal in `docs/proposals/ramble-patch-registration.sql` reviewed, tested, and promoted through the canonical migration history. After the migration and deployed endpoints are verified, configure its website with `NEXT_PUBLIC_SIGNUP_URL=https://luke.gallery/api/mailing-lists/ramble-patch/updates/subscribe` and `NEXT_PUBLIC_CONTACT_URL=https://luke.gallery/api/contact/ramble-patch`. For local integration testing, the Ramble website may run on port 3001 with the backend on port 3000; the local origin is allowed only in development.

Before switching the worker, configure `/api/internal/plant-generation`, disable its old schedule, then enable exactly one schedule in the new deployment and verify it.
