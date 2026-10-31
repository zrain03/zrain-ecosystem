# Zrain Public Catalog Worker

Public Cloudflare Worker + R2 bucket for published product data and product logos.

## Deploy prerequisites (in the existing zrain-ecosystem folder)

The Cloudflare account must support R2. This repository intentionally contains no Cloudflare API keys.

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem\catalog-worker"
npm install
npm test
npx wrangler login
npx wrangler r2 bucket create zrain-ecosystem-catalog
npx wrangler secret put ZRAIN_CATALOG_PUBLISH_KEY
npx wrangler deploy
```

Generate a random secret with at least 32 characters, paste it when Wrangler prompts, and use **the same value** for the Render API `ZRAIN_CATALOG_PUBLISH_KEY` environment variable. Do not commit it, echo it to logs or send it to ChatGPT. If the bucket exists, don't recreate it.

Public GET: `/api/catalog` and `/api/media/<uuid>.png`. Authenticated backend-only PUT `/api/catalog`, POST `/api/media`.

R2 bucket and Worker must be provisioned once; after that products are added via `/admin`. `API_BASE_URL` and `PUBLIC_CATALOG_URL` in frontend require a one-time production setup.
