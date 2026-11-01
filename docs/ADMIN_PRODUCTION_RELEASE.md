# Zrain Ecosystem Admin — Zero-billing release gate

**Status: Cloudflare Worker deployed and LIVE-VERIFIED by the user on 1 November 2026; frontend NOT DEPLOYED.** Worker origin: `https://zrain-ecosystem-catalog.zrain-dev.workers.dev`. The user personally verified `/api/health` (`ok`), `/api/ready` (`true`), and authenticated login plus `/api/admin/auth/me` (`ADMIN`) from PowerShell. **Firebase Spark plan has NOT yet been confirmed**; do not merge or deploy Firebase Hosting until it is confirmed. Do not claim `zrain.web.app/admin` is live yet.

## Hard requirement: no possibility of usage charges

The production path uses **Firebase Spark Hosting + Cloudflare Workers Free + Workers KV Free** only.

- No Cloudflare R2 subscription, no Workers Paid plan.
- No Render deployment, no paid compute instance or paid PostgreSQL.
- No billing method on the project/accounts used for these services.
- No auto-upgrade.
- When the usage quota is exhausted, API/catalog operations may become unavailable instead of incurring an overage.
- Changes in provider plan/terms can never be promised away; the release is blocked unless current account billing settings satisfy all these conditions.

The existing **Neon Free** database project `zrain-ecosystem` (`cool-snow-27258730`) remains isolated and unused by this no-billing production architecture. It does not need to be deleted. The Spring Boot 4.1.2 / JWT project source remains in `backend/` for developer demonstration and unit tests, but is not the deployed Admin API.

## What is ready in source

- JWT admin login verified by a Worker using encrypted Worker secrets. No user sign-up route.
- Hard-fail token verification, rate limiting on login attempts, and protected product endpoints.
- Import of the six official products (Drafts), product edit, publish, unpublish and archive.
- Workers KV Free storage for draft records and public published snapshot.
- Existing Zrain logos and HTTPS image links; **no file upload**.
- Public site continues to show the six original static cards if the API has no valid published catalog.

## Before any production deployment

1. Confirm in Cloudflare dashboard that the account uses **Workers Free** and that no chargeable plan, R2 subscription, or payment method has been enabled for this deployment.
2. Confirm `zrain-ecosystem` Firebase project uses **Spark** (not Blaze).
3. Confirm `catalog-worker/wrangler.toml` lists Workers KV binding only. It must never include `r2_buckets`.
4. Set encrypted Admin email, 32+ random-character password and 32+ byte Base64 JWT signing key as private Wrangler secrets. Never place them in this repo or chat.
5. Deploy the Worker on Free. Confirm its `/api/ready` endpoint reports `ready: true` and check unauthenticated admin access is rejected.
6. Install the frontend in **two stages**, retaining static public cards until six published products are confirmed.

See `catalog-worker/README.md` for the exact one-time deployment commands.

## Two-stage Firebase cutover

**Stage 1 — Enable protected Admin login only.**

- Set `PRODUCTION_API_URL` in `public/api-config.js` to verified HTTPS Cloudflare Worker origin.
- Keep `PRODUCTION_CATALOG_URL` empty. Public homepage remains static.
- Merge reviewed changes to `main`, run `npm run test:release`, then `deploy.ps1 -ProjectId zrain-ecosystem` from an authenticated local Firebase CLI.
- At `https://zrain.web.app/admin`, login with the private account. Import the 6 built-in Drafts, review their links, Publish each and sync to the Worker.

**Stage 2 — Enable dynamic public catalog.**

- Verify `GET /api/catalog` contains exactly the six verified products (no test items).
- Set `PRODUCTION_CATALOG_URL` to `https://<worker>.workers.dev/api/catalog`.
- Rerun tests and deploy Hosting. Check all buttons and Console behavior on desktop and mobile.

**Normal use:** Admin → Add Product → Save Draft → Publish. This edits Workers KV Free; website content refreshes without code changes.

## Operational limits and safeguards

- The free Worker and KV may return errors when daily limits are hit. The homepage falls back to hardcoded cards. Don't upgrade plans to bypass limits.
- Workers KV is eventually consistent; product updates may take roughly a minute to propagate and are not a transactional database. Avoid rapid consecutive edits and use Retry sync if necessary.
- Only the private admin email/password is authorized; strong unique 32+ character password is mandatory. JWTs last 15 minutes and are held only in browser memory.
- Code tests are necessary but not a substitute for real account-plan and security verification.
- The obsolete `render.yaml` Blueprint has been removed from this branch to avoid chargeable Render deployment.
- GitHub source changes do not directly update Firebase Hosting or Cloudflare Worker.

## November 1 update: simple Admin, live catalog, and universal Console

- The public website now reads published entries directly from the existing Workers KV product list. Publish, Unpublish, Archive and edits are reflected automatically without a second sync/write. KV is eventually consistent, so other regions may take about a minute to see changes.
- Every main product action opens Zrain Console. Games show **Play Now**; all web apps and tools show **Open Web App**. GitHub and Google Play remain secondary, direct links.
- Zrain Auth Starter uses its existing web demo in Console; Zrain UI uses the existing showcase. The console still offers **Open in new tab** for websites that block iframe embedding.
- Signed-in Admin can change the password to a unique 16-128 character value. The Worker stores a secret-keyed HMAC in Workers KV and validates the current password; it does not store plaintext or expose the password. Existing 15-minute tokens are rejected after a credential version change (subject to Workers KV propagation).
- Deploy code in **two separate operations on the existing Free services**: `npx wrangler deploy` from `catalog-worker`, then `./deploy.ps1 -ProjectId zrain-ecosystem` from root on a Firebase Spark account. Neither operation provisions new infrastructure.
- Do **not** deploy frontend before Worker is updated: the new frontend relies on Worker serving published rows directly from `admin/products-v1`. 
