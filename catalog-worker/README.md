# Zrain public catalog — Workers + KV Free ONLY

This Worker stores a compact, read-mostly public product directory. It uses **Cloudflare Workers Free and Workers KV Free**. There is no R2 subscription and no image upload.

## Zero-billing rule

Before creating any Cloudflare resource, confirm the account is on **Workers Free**, not Workers Paid. Do **not** enable Workers Paid, R2, a payment method, or automatic upgrades. On Workers KV Free, reaching its limits means further reads/writes fail; the Firebase public homepage retains the six HTML fallback cards.

The backend Java API (when provisioned without a payment method) publishes the JSON snapshot using a secret set separately on the Worker and backend. Never place the secret in Git, commit logs, chat or the public browser.

## One-time Worker setup (requires Cloudflare account authentication)

From the existing `zrain-ecosystem\catalog-worker` folder:

```powershell
npm install
npm test
npx wrangler login
npx wrangler kv namespace create ZRAIN_CATALOG --update-config
npx wrangler secret put ZRAIN_CATALOG_PUBLISH_KEY
npx wrangler deploy
```

Wrangler's `--update-config` writes the new namespace ID to `wrangler.toml`. Do not create a duplicate namespace if the binding already exists.

Public endpoints: `GET /api/health` and `GET /api/catalog`. Only the authenticated Java backend may `PUT /api/catalog`.

The Worker has no image-upload endpoint: use the existing Zrain game icons, official Zrain logo, or a pre-existing HTTPS image link.

## Provider limits

Workers Free offers bounded requests; Workers KV Free has hard limits for operations. Availability can stop at a quota threshold. Do not upgrade plans to resolve that; let the public site's built-in fallback remain visible.
