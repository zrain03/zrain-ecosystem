/*
 * Fail / File: test/free-only.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan free only, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests free only contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan free only, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests free only contracts, outputs and failure paths without making production requests.
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
  assert.match(setup, /wrangler kv namespace list/);
  assert.match(setup, /Linked the existing KV namespace/);
  assert.doesNotMatch(setup, /wrangler kv namespace create ZRAIN_CATALOG/);
  assert.match(deploy, /Type SPARK/);
  assert.match(deploy, /\/api\/ready/);
  await assert.rejects(access(new URL('../render.yaml', import.meta.url)));
});

test('Free-only public catalog stays behind an explicit one-time endpoint configuration', async () => {
  const config = await read('../public/api-config.js');
  assert.match(config, /const PRODUCTION_API_URL = "https:\/\/zrain-ecosystem-catalog\.zrain-dev\.workers\.dev"/);
  assert.match(config, /const PRODUCTION_CATALOG_URL = "https:\/\/zrain-ecosystem-catalog\.zrain-dev\.workers\.dev\/api\/catalog"/);
  assert.match(config, /ENABLE_DYNAMIC_CATALOG = Boolean\(PUBLIC_CATALOG_URL\)/);
});
