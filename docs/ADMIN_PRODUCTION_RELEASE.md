# Zrain Ecosystem Admin — Production release

This is a release checklist, not a claim that production has been deployed.
Every source remains under `zrain-ecosystem`. The original Zrain Auth Starter repository is unchanged.

## Validated

- Java Spring Boot 4.1.2 / Java 21 JWT Admin API and role protection.
- Account bootstrap with BCrypt, password validation, no public registration.
- Flyway schema for PostgreSQL.
- Cloudflare Worker with R2-backed public catalog and logo uploads.
- Admin dashboard with import, Draft/Publish/Unpublish, logo upload, website sync.
- Public site renders the published catalog and falls back to original static cards if unavailable.

## Release prerequisites (one-time external setup)

1. **Cloudflare**: R2 must be activated for the account. Use the existing Cloudflare account, but create a NEW bucket dedicated to this project: `zrain-ecosystem-catalog`. R2 usage has provider limits/terms.
2. **PostgreSQL**: Create a persistent **separate** Neon PostgreSQL database for Zrain Ecosystem. Do not reuse Zrain Links or other apps' databases; do not use Render Free Postgres, which expires after 30 days.
3. **Render**: Create a NEW Free Web Service with this repo on the intended release branch, root `backend`, Dockerfile `backend/Dockerfile`, Docker context `backend`; the `render.yaml` Blueprint documents the intended configuration.
4. **Firebase**: An authenticated Firebase CLI is needed on the user's computer for the final production Hosting deploy. GitHub merges do not publish Firebase Hosting by themselves.

Do not put credentials or password values into GitHub, chat, logs, or committed files.

## A. Cloudflare Worker deployment

From clean branch `feature/admin-console-foundation`:

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem\catalog-worker"
npm install
node --test test/worker.test.js
npx wrangler login
npx wrangler r2 bucket list
npx wrangler r2 bucket create zrain-ecosystem-catalog
npx wrangler secret put ZRAIN_CATALOG_PUBLISH_KEY
npx wrangler deploy
```

If the bucket already exists, do not recreate it. Generate a long cryptographically random secret (at least 32 characters), store it in a password manager and supply the **same exact value** to the backend environment variable below. Do not echo or paste the secret in chat. Record the deployed origin `https://<worker>.<subdomain>.workers.dev`.

Test the public `/api/health` endpoint on that Worker, but `/api/catalog` will return 404 until the admin publishes its first snapshot. That's intentional.

## B. Persistent PostgreSQL

Create a new PostgreSQL project (suggested name `zrain-ecosystem`) at Neon. Obtain an SSL-protected connection URI in JDBC form:

`jdbc:postgresql://<neon-host>/<db>?sslmode=require`

Store the matching database username and password securely. Do not commit credentials. The application uses Flyway to create `users` and `products` on its first authorized startup.

## C. Render Java API

In Render, create the new service using `render.yaml` on the intended branch, or configure Docker manually with:

- Project repository: `zrain03/zrain-ecosystem`
- Root directory/build context: `backend`
- Dockerfile path (from repo root): `backend/Dockerfile`
- Plan: Free; region: Singapore
- Health check: `/api/health`
- Auto-deploy disabled until production smoke tests pass

Set environment variables privately:

| Key | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JDBC_DATABASE_URL` | New Neon JDBC URL |
| `JDBC_DATABASE_USERNAME` | New Neon DB user |
| `JDBC_DATABASE_PASSWORD` | New Neon DB password |
| `ZRAIN_JWT_SECRET_BASE64` | 32+ bytes generated securely in Base64; Render Blueprint can generate this |
| `ZRAIN_ADMIN_EMAIL` | Your private administrator email |
| `ZRAIN_ADMIN_PASSWORD` | Unique strong administrator password, minimum 16 characters |
| `ZRAIN_ALLOWED_ORIGIN` | `https://zrain.web.app` |
| `ZRAIN_CATALOG_WORKER_URL` | Cloudflare Worker HTTPS origin, without `/api/catalog` |
| `ZRAIN_CATALOG_PUBLISH_KEY` | Same secret supplied to Wrangler |

Production fails closed and refuses to start without these settings. It also refuses H2 as the production database.

After Render reports a healthy deployment, open `https://<render-service>.onrender.com/api/health`. Only expect `{"status":"ok"}`; no admin information or passwords are exposed.

## D. Two-stage production cutover (keeps the public website intact)

The database is initially empty. Do not immediately enable the dynamic catalog before importing the six products.

**Stage 1 — Admin deployment with static public directory:**

1. After the Render API and Cloudflare Worker are healthy, set **only** `PRODUCTION_API_URL` in `public/api-config.js` to the verified Render HTTPS origin.
2. Leave `PRODUCTION_CATALOG_URL` as the empty string. This preserves the existing six hardcoded cards on the public website.
3. Merge the reviewed Admin branch and deploy Firebase Hosting using the existing gated `deploy.ps1 -ProjectId zrain-ecosystem` command. The rewrite enables `https://zrain.web.app/admin`. Sign in with the actual ADMIN account and confirm JWT protected API requests work.
4. Click **Import the 6 existing products** and review them as Drafts.
5. Publish only Guess The Flag, Memory Rush, Zrain Auth Starter, Zrain Monitor, Zrain UI and Zrain Links; don't publish test records.
6. Each Publish calls the Java catalog API, which writes a new snapshot to Cloudflare. If it reports a sync error, use **Retry website sync**.
7. Confirm `https://<worker>/api/catalog` returns all six products with accurate links, logos and categories, and check upload of one logo through the protected UI.

**Stage 2 — Switch homepage to Admin-managed catalog:**

1. Now set `PRODUCTION_CATALOG_URL` in `public/api-config.js` to the verified HTTPS Cloudflare Worker URL ending with `/api/catalog`.
2. Run all tests and deploy Firebase Hosting again. It now reads published product data from Cloudflare, but retains static fallback cards if the Worker is unreachable.
3. Test all actions and Console views on desktop and mobile, verify no missing products, and check browser console/network errors.

**After Stage 2:** Adding, editing, publishing or unpublishing a product updates the public catalog without manual HTML edits or Firebase redeploys. Content may be cached by Cloudflare for a short period.

## Safety and operational requirements

- Never merge/deploy this feature until the real hosted Java API, persistent database, Worker and admin credentials all work.
- Never redirect any other Zrain app to this auth service; each app retains its own Firebase Auth.
- Verify `401` for missing JWT, `403` for non-admin JWT, and that admin changes are denied by the backend, not merely hidden in frontend.
- Browser JWT remains in memory; page reload requires login again. HTTPS required outside localhost.
- Render Free cold-start delay affects the Admin API but not the public Cloudflare snapshot.
- R2 object storage and free-tier availability are subject to Cloudflare account activation and usage limits.
- Check responsive layout, link destinations and public catalog fallback on real mobile/desktop before announcing completion.
