<!--
Fail / File: tool-runtime/docs/v1.7-reference/README-v1.7.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Tools v1.7 — Web-only Community Feedback untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Tools v1.7 — Web-only Community Feedback reference for maintenance and auditable release decisions.
-->

# Zrain Tools v1.7 — Web-only Community Feedback

# Zrain Web Community Feedback — Pre-deployment v1.7

This release **does not deploy** and does not change any live website. It stages uniform community feedback for every current public Zrain web product except the games. Each web app has its own discussion; the 28 utilities share feedback with the five independently hosted tool families, not all with one another.

## Feedback scope (not on games)

| Public web app | Independent public discussion |
|---|---|
| Zrain Ecosystem | https://github.com/zrain03/zrain-ecosystem/issues/20 |
| Zrain Console Showcase | https://github.com/zrain03/zrain-ecosystem/issues/21 |
| Zrain UI Showcase | https://github.com/zrain03/zrain-ecosystem/issues/19 |
| Zrain Links | https://github.com/zrain03/zrain-ecosystem/issues/16 |
| Zrain Monitor | https://github.com/zrain03/zrain-ecosystem/issues/17 |
| Zrain Auth Starter | https://github.com/zrain03/zrain-ecosystem/issues/18 |
| Zrain Image Tools | https://github.com/zrain03/zrain-ecosystem/issues/22 |
| Zrain PDF Tools | https://github.com/zrain03/zrain-ecosystem/issues/23 |
| Zrain Document Tools | https://github.com/zrain03/zrain-ecosystem/issues/24 |
| Zrain Developer Tools | https://github.com/zrain03/zrain-ecosystem/issues/25 |
| Zrain Productivity Tools | https://github.com/zrain03/zrain-ecosystem/issues/26 |

- Every web app renders `feedback.css` and `feedback-embed.js` locally, with a separate `data-product="<product-slug>"` attribute. Shared visuals, different issues.
- Feedback appears **before the footer**. Main Zrain apps and showcases have it; Zrain Monitor's guide/privacy and Zrain Links' Visits page also use their parent product thread.
- The static source bundle for the five new Tools sites is in this release. Other public apps are staged as GitHub Pull Requests (see below), **not merged to production**.
- All non-game pages retain the official Zrain logo and official footer credit. Games retain their game icons and do not load this widget.
- Reading comments is public. To comment, users sign in to GitHub, not to a Zrain account. The core web apps do not require a GitHub account.
- The widget does **not** offer an anonymous write endpoint, private admin password, bearer token, independent paid database, or fabricated reviews.
- We cannot promise a literal lifetime: the history depends on GitHub Issues and repository availability. The unauthenticated GitHub REST API is limited (normally 60 requests/hour/IP), so comments may temporarily fail to load; the original GitHub issue is always linked as a fallback.

## Admin moderation (delete a comment)

1. Sign in to GitHub as the owner of repository `zrain03/zrain-ecosystem` or an account with sufficient write permissions.
2. Open the Zrain product's GitHub discussion using **Read on GitHub** or **View comment on GitHub**. Each product is separate.
3. On an abusive, spam or privacy-violating comment, open the `...` menu near that comment, choose **Delete**, and confirm. GitHub enforces repository permissions; ordinary visitors cannot delete other people's comments.
4. Refresh the app's Feedback section. It fetches comments again (`cache: no-store`), so deleted comments disappear after reload. Moderation is intentionally conducted on GitHub, not by an unsecured Delete button in public web JavaScript.
5. Keep respectful negative feedback visible. Do not delete merely because a user disliked a Zrain feature.

## GitHub Pull Requests staged, not deployed

- Ecosystem, Console, UI Showcase: https://github.com/zrain03/zrain-ecosystem/pull/28
- Monitor homepage, How it works, Privacy: https://github.com/zrain03/zrain-monitor/pull/2
- Auth Starter web demo: https://github.com/zrain03/zrain-auth-starter/pull/5
- Links home, Visits: https://github.com/zrain03/zrain-links/pull/7

These branches do not automatically publish. On Firebase/Cloudflare Hosting, verify the actual **Free** plan before doing any release; do not enable a paid plan or attach billing unexpectedly. Merge/deploy only when ready. Zrain Monitor's CSP was minimally extended for GitHub's public REST API and avatar image host, and its existing strict script/style policies were retained.

## Zrain Ecosystem product categories

Keep **Games**, **Developer Tools** and **Online Services**, not six sections and not 28 standalone utilities. Five separately published tool families belong as five product entries when their HTTPS URLs are actually deployed and verified:

- Image Tools → Online Services
- PDF Tools → Online Services
- Document Tools → Online Services
- Developer Tools → Developer Tools
- Productivity Tools → Online Services

Don't publish a Zrain tool as live until its actual URL exists and its user flows have been checked.

## Local testing on Windows

```powershell
$downloads = Join-Path $env:USERPROFILE 'Downloads'
Expand-Archive -LiteralPath (Join-Path $downloads 'Zrain-Tools-v1.7-SOURCE.zip') -DestinationPath $downloads
Set-Location (Join-Path $downloads 'Zrain-Tools-v1.7')
npm run check
$env:PORT = '8766'
npm start
```

Open `http://127.0.0.1:8766/` manually. Stop older server with `Ctrl+C` first.

## QA evidence and limitations

See `QA-REPORT.md`. Existing image super-resolution and PDF/Office converter limitations remain. UI and feedback tests are not an end-to-end certification of all 28 file exports. No live production deployment was done.
