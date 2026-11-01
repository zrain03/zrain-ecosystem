# Zrain Admin — strict Free-only deployment

The live Admin does **not** use Render, R2, a paid database or a credit card. Java Spring Boot remains in `backend/` as existing source/test material; the production Admin API is Cloudflare Workers Free and stores its small catalog in Workers KV Free. Firebase Hosting should remain on Spark.

## Never activate billing

- Confirm **Workers Free**, not Workers Paid, in the Cloudflare dashboard before deploying.
- Do not click **Add R2 subscription**, do not add a payment method, and do not upgrade any plan.
- Verify the Firebase project is on **Spark**. If it is Blaze, stop the release.
- If any provider asks for a charge, card, subscription, or overage approval, **stop**. The site stays on static fallback cards instead of risking a bill.

Cloudflare Workers Free / KV Free have usage limits and return errors if exceeded. Free quotas can affect uptime; there are no automatic paid overages on these Free plans.

## One-time Worker provisioning (Cloudflare account sign-in needed)

In the existing `zrain-ecosystem/catalog-worker` folder:

```powershell
npm install
npm test
npx wrangler login
npx wrangler kv namespace create ZRAIN_CATALOG --update-config
npx wrangler secret put ZRAIN_ADMIN_EMAIL
npx wrangler secret put ZRAIN_ADMIN_PASSWORD
npx wrangler secret put ZRAIN_JWT_SECRET_BASE64
npx wrangler deploy
```

Only create the namespace once. Wrangler writes its generated namespace ID into `wrangler.toml`. There is no R2 bucket.

Three encrypted Worker secrets are required:
- `ZRAIN_ADMIN_EMAIL`: your private admin email.
- `ZRAIN_ADMIN_PASSWORD`: a **random 32+ character unique password**, kept in a password manager.
- `ZRAIN_JWT_SECRET_BASE64`: secure random 32+ bytes encoded in Base64, kept private.

Do not paste these secrets into ChatGPT, GitHub, a public URL or screenshots. Anyone visiting `/admin` sees a login screen; the Worker verifies authorization.

## Production integration

The Worker exposes:
- `GET /api/health` — safe health check.
- `GET /api/ready` — true only when KV binding and admin secrets are in place.
- `POST /api/admin/auth/login` and `GET /api/admin/auth/me` — JWT admin access.
- `GET/POST/PUT /api/admin/products...` — protected product management.
- `POST /api/admin/products/import-existing` — load six official Zrain products as Drafts.
- `POST /api/admin/catalog/sync` — publish a snapshot to the public key.
- `GET /api/catalog` — published public product list.

The public website is delivered by Firebase Hosting Spark. Worker KV may take time to propagate changes globally; refreshing the Admin may briefly show older state.

## Separate static cutover

1. Confirm Worker `/api/ready` reports ready.
2. In `public/api-config.js`, set only `PRODUCTION_API_URL` to the verified Worker HTTPS origin, leave `PRODUCTION_CATALOG_URL` blank.
3. Deploy the Admin UI using the gated `deploy.ps1` from the **main branch after review/merge**.
4. Login at `zrain.web.app/admin`, import the six products, review and Publish each. Click **Retry website sync** if needed.
5. Confirm the Worker `/api/catalog` lists all six official products.
6. Set `PRODUCTION_CATALOG_URL` to the Worker `/api/catalog` HTTPS URL and redeploy Firebase.

Afterward: Add Product → Save Draft → Publish. No manual HTML edit is required, provided Free quota remains available.
