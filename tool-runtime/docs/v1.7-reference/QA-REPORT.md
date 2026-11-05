<!--
Fail / File: tool-runtime/docs/v1.7-reference/QA-REPORT.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Web Community Feedback — QA report v1.7 untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Web Community Feedback — QA report v1.7 reference for maintenance and auditable release decisions.
-->

# Zrain Web Community Feedback — QA report v1.7

**Status:** local implementation and repository Pull Requests prepared; production deployment **not performed**. No game widgets.

## Confirmed checks

- `npm run check` completed: **43 / 43 tests passed** after extending tests to catch missing visible feedback headings.
- **33 / 33** generated tool-family pages (5 landing + 28 utility pages): right feedback key, local stylesheet and script, comments section, responsive mobile/desktop smoke tests, no page script errors in mock testing.
- **5 / 5** tool families in Chromium: mock authentic GitHub response displays name/date/comment and correct product issue URL; text such as `<script>` is rendered inert, no script execution.
- Refresh after deletion: replacing mocked API response with `[]` removes obsolete comment elements and shows zero-comments state.
- Public API inaccessible (HTTP 403): visible error fallback and direct GitHub discussion link retained.
- Guess The Flag / Memory Rush: no Feedback widget initialized.
- Repo CI at latest inspected branch commits: Ecosystem, Monitor, Auth Starter, Links checks completed successfully. Live hosting not validated.
- Official Zrain logo retained on non-games and game icons left alone. `Made for people. Built with purpose.` retained as official tagline.

## Scope of the 11 independent discussion spaces

| App | Issue # |
|---|---|
| Zrain Ecosystem | 20 |
| Zrain Console Showcase | 21 |
| Zrain UI Showcase | 19 |
| Zrain Links | 16 |
| Zrain Monitor | 17 |
| Zrain Auth Starter | 18 |
| Zrain Image Tools | 22 |
| Zrain PDF Tools | 23 |
| Zrain Document Tools | 24 |
| Zrain Developer Tools | 25 |
| Zrain Productivity Tools | 26 |

## Notes for final release acceptance

1. Merge each PR only after code review; these are staged branches, not deployed websites.
2. Verify that GitHub comments actually load on the live websites, especially on Monitor (strict CSP) and Links (Cloudflare frontend), where localhost mocks are not enough.
3. Use a non-owner GitHub account to confirm moderation controls cannot delete others' comments.
4. Check website headers, footer placement, keyboard focus, 360px mobile width, GitHub login redirection and actual deletion + refresh.
5. Keep the 5 new Tool product entries as Draft in Ecosystem until deployed HTTPS URLs and major file workflows are validated. Core PDF/Office/OCR/Image Enhancer behavior is unchanged by this feedback patch.
6. Check that no billing plan was upgraded. GitHub public Issues does not require paid comment storage, but does have API limits and service-dependent retention.
