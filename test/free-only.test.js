import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('zero-billing production path excludes R2 and Render', async () => {
  const [config, worker, admin, setup, deploy] = await Promise.all([
    read('../catalog-worker/wrangler.toml'),
    read('../catalog-worker/src/index.js'),
    read('../public/admin/index.html'),
    read('../scripts/setup-free-admin-worker.ps1'),
    read('../deploy.ps1')
  ]);
  assert.match(config, /Workers KV Free only/i);
  assert.doesNotMatch(config, /\[\[r2_buckets\]\]/);
  assert.doesNotMatch(worker, /ZRAIN_ASSETS|api\/media/);
  assert.doesNotMatch(admin, /id="upload-logo"|id="product-logo-file"/);
  assert.match(setup, /Type FREE to continue/);
  assert.match(setup, /wrangler kv namespace create ZRAIN_CATALOG/);
  assert.match(deploy, /Type SPARK/);
  assert.match(deploy, /\/api\/ready/);
  await assert.rejects(access(new URL('../render.yaml', import.meta.url)));
});

test('Free-only public catalog stays behind an explicit one-time endpoint configuration', async () => {
  const config = await read('../public/api-config.js');
  assert.match(config, /const PRODUCTION_API_URL = ""/);
  assert.match(config, /const PRODUCTION_CATALOG_URL = ""/);
  assert.match(config, /ENABLE_DYNAMIC_CATALOG = Boolean\(PUBLIC_CATALOG_URL\)/);
});
