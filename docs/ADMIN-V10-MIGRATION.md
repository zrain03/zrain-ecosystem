<!--
Fail / File: docs/ADMIN-V10-MIGRATION.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Ecosystem v10 Admin integration untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Ecosystem v10 Admin integration reference for maintenance and auditable release decisions.
-->

# Zrain Ecosystem v10 Admin integration

## What changed

- `/admin-layout-preview.html` is a functional **in-memory** five-category admin design preview, no login or remote persistence.
- `/admin/` is a real API-backed administrator client with JWT auth, add/edit project, publish/unpublish/archive, password change and current catalogue. It is only usable when **deployed to an allowed origin** alongside the existing Cloudflare Worker API.
- The 48 browser tools are **source-managed** and labelled accordingly. No fake publish switches.
- New category codes: `PLAY`, `DESIGN`, `DOCUMENTS`, `BUILD`, `EVERYDAY`. Legacy codes are still supported.
- Existing production data and accounts are preserved. No automatic schema/database migration is performed.

## Important release dependency

The current production Worker **does not yet accept** the five category codes. Upgrade its validator before using the live v10 admin to save products. The project includes an **opt-in source-only migration**:

```powershell
# From the v10 preview project folder
node scripts/upgrade-worker-categories.mjs "$env:USERPROFILE\Downloads\Zrain\Projects\zrain-ecosystem\catalog-worker\src\products.js"
```

The script verifies the exact file/path/pattern, preserves a backup, and changes only the allowed category set. It does **not** deploy. Run existing Worker tests and carefully review/commit before any deployment. The Worker database model already stores category as a string; existing entries with the three legacy category codes keep working.

For local viewing, use `http://127.0.0.1:<port>/admin-layout-preview.html`. That preview cannot publish real products.

Live admin is under `/admin/`, but cannot authenticate from arbitrary `localhost` origins due to the Worker CORS allowlist. Do not weaken CORS to make local demos work. Test actual login in an authorized development environment and only after proper review.

## Secondary link limit

The existing Worker stores **one optional secondary URL**. New games can use a Google Play link **or** a GitHub link, not both at once. Existing Guess The Flag and Memory Rush source metadata separately includes their verified GitHub links. Do not claim two independent secondary URLs are persisted until the backend schema supports them.

## Security / transparency

- JWT token stays in memory, not `localStorage` or cookies.
- Browser tools are not managed as regular Worker products.
- Preview mode is explicitly labelled non-persistent.
- Production must not be updated merely because static Node tests pass.
- Admin public listing is not a privileged data source; private Draft/Archived rows are retrieved only via authenticated API.
