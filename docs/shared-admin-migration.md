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

Optional `SOW_APP_GITHUB_REPOSITORY` and `SOW_APP_GITHUB_BASE_BRANCH` override defaults (`lukecd/sow.garden-app` and `main`). `BLOB_READ_WRITE_TOKEN` is required by the portfolio's scheduled book discovery refresh; it is not part of the Sow screenshot. As of November 19, 2026 it was absent from the production Vercel project's environment list, so the hosted refresh cannot run until private Blob storage is configured. Vercel-provided system variables are supplied by the platform. `ADMIN_SECRET`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, and `NEXT_PUBLIC_APP_STORE_URL` from the old example file are not required for this imported admin's runtime.

Environment-variable presence is not proof that credentials work or have not expired. Verify the relevant provider and its permissions when exercising each integration. The local `.vercel` link may point at a different project; explicitly select `luke-dot-gallery-izrd` when auditing the deployment that serves `luke.gallery`.

A preview pointed at the production Supabase project can read and modify real contacts and can send real emails or create real PRs. Use an isolated project and non-production credentials for write tests. Configure the destination's Supabase auth redirect URL for `/auth/callback` and verify login and MFA before changing any live URLs. No secrets have been copied or tested in this change.

The shared Supabase project's complete migration history, configuration, and verification SQL have been copied into this repository's `supabase/` directory from `sow.garden-web` main at commit `1bf73f9`. This includes the Sow API migrations. After this change is merged, use this repository as the sole source for new migrations; do not create a separate history in the old repository. The project itself is unchanged by copying these files.

The recorded remote migration versions were checked on November 19, 2026: all versions through `20261112064047` were applied, and `20261119012845_ramble_patch_registration` was pending. This is a point-in-time result; check again before any deployment. From this repository, link the intended Supabase project and run `supabase migration list --linked` to compare local and remote versions. Investigate unexpected differences before applying anything. Review the pending migration and use the normal deployment workflow; do not repair migration history or reset the live database merely to make the lists match.

The shared mailing signup endpoint is `/api/mailing-lists/[app]/[list]/subscribe`; allowed external origins are in `admin-lib/mailing-signup-origins.ts`. Existing forms still point to the old deployment until deliberately changed. The `/api/contact` route preserves the portfolio JSON form and also accepts the Sow multipart relay. Verify delivery before setting `SOW_ADMIN_ORIGIN=https://luke.gallery` in the Sow website deployment.

Ramble Patch has a contact endpoint at `/api/contact/ramble-patch` and an admin messages view. Its registration, message storage, and creator-wide consent are in `supabase/migrations/20261119012845_ramble_patch_registration.sql`; that migration was tested locally but was not applied to production as part of the transfer. After the migration and deployed endpoints are verified, configure its website with `NEXT_PUBLIC_SIGNUP_URL=https://luke.gallery/api/mailing-lists/ramble-patch/updates/subscribe` and `NEXT_PUBLIC_CONTACT_URL=https://luke.gallery/api/contact/ramble-patch`. For local integration testing, the Ramble website may run on port 3001 with the backend on port 3000; the local origin is allowed only in development.

Before switching the worker, configure `/api/internal/plant-generation`, disable its old schedule, then enable exactly one schedule in the new deployment and verify it.

## Before retiring the old repository

- Confirm the new Sow website has replaced the old public site at its existing URLs, including `/api/help/v1`, and verify iOS help and privacy links. Audit any images and content still needed from the old repository before deletion.
- Verify the new admin's login, contact delivery, mailing lists, plant workflow, and app handoff; switch Sow's `SOW_ADMIN_ORIGIN` only after successful delivery tests. Ramble Patch's existing website defaults still point to `www.sow.garden`; update and verify them after the database and endpoints are ready. Relaxation Station's migration is being handled separately.
- Transfer the plant-generation cron deliberately: the old deployment schedules `/api/internal/plant-generation` every minute; this repository currently schedules only the books refresh. Ensure only one plant worker runs.
- Update active documentation in `sow.garden-api` that identifies the old repository as the migration owner, and review any external deployment, webhook, token, or automation that references the old GitHub repository. Confirm the separate Sow API remains deployed and maintained.
- Verify the GitHub and hosting cutovers independently before archiving. Deleting a GitHub repository can also remove its history, issues, pull requests, and assets even if a deployment continues to serve traffic; retain anything needed first.
