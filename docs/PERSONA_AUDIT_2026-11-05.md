<!--
Fail / File: docs/PERSONA_AUDIT_2026-11-05.md
Pembangun / Developer: Zrain
Dicipta / Created: 2026-11-05
Dikemas kini / Last updated: 2026-11-05
BM: Bezakan ujian automatik yang lulus daripada audit Persona atau deployment yang belum disahkan.
EN: Separate passing automated tests from unverified Persona, browser and deployment checks.
-->

# Zrain Ecosystem release audit: 5 November 2026

## Persona close-out review, 5 November 2026

- **BM:** Semua 144 rekod header yang sebelumnya pending telah disemak. Tiga fail pihak ketiga kekal tanpa pengubahsuaian, dan satu fail yang sudah ada header dibetulkan status registernya.
- **EN:** All 144 previously pending header records were reviewed. Three third-party files remain unchanged, and one existing-header record was corrected.
- **BM:** Registry menyenaraikan 263 fail: 159 inline, 70 aset generated, 23 external-registry, 8 upstream/shared dan 3 third-party. Tiada header inline yang masih pending.
- **EN:** The inventory holds 263 files: 159 inline, 70 generated, 23 external-registry, 8 upstream/shared and 3 third-party. No inline header is pending.
- **BM:** Sumber executable Java/JS/CSS/HTML asal dikekalkan; perubahan bukan komen hanya pada ujian lama, provenance, semakan Persona, konfigurasi Git dan dokumentasi release.
- **EN:** Existing executable Java/JS/CSS/HTML is preserved; non-comment modifications are confined to legacy tests, provenance, Persona checking, Git configuration and release documentation.
- **BM:** Suite release merangkumi 43 ujian lama dan 123 ujian semasa, keseluruhan 166 ujian Node. Ujian Java 7/7 lulus di Windows sebelum perubahan komen ini; GitHub CI perlu mengesahkan semula selepas push branch review.
- **EN:** The release suite includes 43 legacy and 123 current tests, totaling 166 Node tests. Seven Java tests passed on Windows before these comment changes; GitHub CI must reconfirm after review-branch push.
- **BM:** Semakan browser setempat di persekitaran penyedia terhalang dengan `ERR_BLOCKED_BY_ADMINISTRATOR`; ini bukan keputusan pass browser.
- **EN:** Local-browser checks were blocked by `ERR_BLOCKED_BY_ADMINISTRATOR` in the authoring environment; this is not a browser pass.
- **BM:** `tool-runtime/dist` boleh dijana daripada source dan tidak perlu dimasukkan ke Git. `public/tools` perlu kekal untuk Firebase Hosting.
- **EN:** `tool-runtime/dist` is rebuildable and must not be tracked; `public/tools` must remain available to Firebase Hosting.
- **BM:** Status release: source verification and review-branch candidate; production deployment, live catalogue and visual acceptance still require separate gates.
- **EN:** Release status: source-verified review candidate; production deployment, live catalogue and visual acceptance remain separate gates.

## Verified in the current source workspace

- Homepage inventory: 58 distinct entries, comprising 10 projects and 48 bundled browser tools.
- Canonical taxonomy: 11 categories from `public/categories/category-data.mjs`.
- Long category lists: JavaScript measures the first five rendered rows and enables internal vertical scrolling when more exist; no extra UI text.
- Existing Cloudflare Published-only semantics preserved; Draft/Archived entries are not displayed after a successful API refresh.
- Admin worker compatibility: 11 code round-trips, plus reading older category codes.
- Shared UI: `@zrain/ui` pin `a109401fa591afa9f66479fa8d86f1ed1679d70b`, identical copied assets for both the main website and all five Tools families.
- Tests: 47 Ecosystem, 59 tools runtime and 17 catalog Worker tests passed, total 123 automated checks. 48 tools build passed.

## Not verified yet

- Real browser visual/scroll/keyboard tests: headless Chromium was blocked from localhost by the execution environment. Must verify on Windows.
- Java backend CI and PostgreSQL integration: require GitHub Actions or Windows Maven execution; not included in the local Node pass.
- Live catalog URL status: Cloudflare Published data still controls active project visibility after API refresh. 58 is the full source fallback inventory.
- End-to-end live deployment: not attempted; no Firebase Hosting or Worker resources changed.
- Persona metadata is complete for inventoried files; semantic correctness still requires continued human review, not mere header counts.
- Git source control: uploaded ZIP contains staged/uncommitted changes; patch installer does not commit, reset, delete or push them.

## Safety and deletion

- No source project or service is deleted; `tool-runtime/dist/` is reproducible build output and is excluded from source release ZIP. Existing public tool pages remain necessary for Firebase Hosting.
- No new service requiring billing. Existing privacy and security checks remain in scope.
- Live catalog with missing published projects can show fewer than 58; this is intentional rather than exposing Draft or fabricating a published record.
