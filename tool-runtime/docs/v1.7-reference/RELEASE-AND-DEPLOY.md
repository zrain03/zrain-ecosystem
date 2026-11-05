<!--
Fail / File: tool-runtime/docs/v1.7-reference/RELEASE-AND-DEPLOY.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Tools v1.7 — Release status / deployment untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Tools v1.7 — Release status / deployment reference for maintenance and auditable release decisions.
-->

# Zrain Tools v1.7 — Release status / deployment

## Status
- Built locally: **five independently hostable static websites** with 28 utilities in total.
- Community feedback threads: **14 created publicly** under https://github.com/zrain03/zrain-ecosystem/issues . 8 existing showcased projects + 5 tool families + historical CryptoQuest.
- Test result: **39/39 Node tests pass**. HTML/static assets and HTTP routes are checked in the packaging process. Do not treat this as proof all 28 PDF/Office/OCR exports work with every file.
- Ecosystem feedback PR: https://github.com/zrain03/zrain-ecosystem/pull/28
- Additional PRs: https://github.com/zrain03/zrain-monitor/pull/2 , https://github.com/zrain03/zrain-auth-starter/pull/5 , https://github.com/zrain03/zrain-links/pull/7 .
- **No live Firebase/Cloudflare Hosting deployment performed**: no verified hosting credentials nor project billing state are available in this runtime. These PRs are not merged automatically.

## Five products and categories
- Zrain Image Tools → Online Services
- Zrain PDF Tools → Online Services
- Zrain Document Tools → Online Services
- Zrain Developer Tools → Developer Tools
- Zrain Productivity Tools → Online Services
Games stays the third category. Do not create six new category sections; do not create 28 individual entries.

## Feedback experience
Every standalone tool website and its child tool pages loads the `feedback-embed.js` file locally before the footer, keyed to the respective product. It uses an official public GitHub Issue for real comments; never uses dummy customer quotes or fabricated ratings. Anyone can read comments; a GitHub account is required to comment. This avoids paid storage/auth infrastructure, but displays are rate-limited by GitHub API and storage history cannot be guaranteed forever. Embedded comments render as plain text, not executable HTML. Moderation for abuse or personal information takes place at GitHub.

## Hosting without surprise billing
1. Keep Firebase **Spark** if using Firebase Hosting. Do not enable Blaze or billing for these products. Check your real Firebase account plan in the console first. Spark usage is limited; requests beyond limits may stop instead of incurring usage charges, subject to product rules.
2. Verify each Firebase site ID exists and belongs to the intended existing project before deployment. Site IDs proposed below are **suggestions**, not verified allocations: zrain-image-tools, zrain-pdf-tools, zrain-document-tools, zrain-developer-tools, zrain-productivity-tools.
3. Deploy the CONTENTS of each `dist/<product>/` directory to its intended Hosting site. Do not overwrite the existing `zrain` site or other production apps by accident.
4. Verify real HTTPS URLs before setting corresponding draft catalog entries to Published via protected Zrain Ecosystem admin.
5. Only after merging Ecosystem PR and verifying its tests should an authenticated developer perform the existing `firebase deploy --only hosting --project <actual-project-id>` from that repository. This is not an automated action in the current GitHub Actions workflow.

## Native games and remaining products
The official Ecosystem feedback directory already has public discussion threads for both games, all eight existing showcased creations and five tool families. The existing game icons remain unchanged. Native Android apps require a future signed Flutter release to place an in-app Feedback entry in the Settings screen; this static bundle does NOT modify Play Store APKs. Other site integrations are staged as PRs pending release/QA. CryptoQuest is not a featured product.

## Most important integrity checks
- Keep official logo on non-games and existing unique game icons on games.
- Preserve exact footer tagline `Made for people. Built with purpose.`; supporting line is `Explore the Zrain Ecosystem.`
- No authentication required to use the core tools; GitHub login only to post feedback.
- Do not pretend to perform AI image detail recovery or lossless PDF/Word conversion, and do not publish products as validated until QA passes with representative real files.


## GitHub release progress (1 November 2026)

Community Feedback source changes have been merged into the default/target branches of the Zrain Ecosystem, Monitor, Auth Starter, and Links repositories. Zrain Auth Starter GitHub Pages deployment has a successful GitHub Actions run. Firebase Hosting and Cloudflare Pages production deployment are **not** confirmed and require credentialed CLI steps from the owner's computer. Five Tools sites still need actual URLs before catalog publication.
