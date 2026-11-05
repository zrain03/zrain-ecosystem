<!--
Fail / File: tool-runtime/docs/v1.7-reference/NHAKO-RESEARCH-AND-ZRAIN-DECISIONS.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Nhako × Zrain — Independent product/UX research untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Nhako × Zrain — Independent product/UX research reference for maintenance and auditable release decisions.
-->

# Nhako × Zrain — Independent product/UX research

**Research date:** 1 November 2026  
**Scope:** Public Nhako homepage, Nhako Tools, NhakoSearch, NhakoCapture (project page and Chrome Web Store), Nhako Beam, and the public Nhako Tools GitHub repository.  
**Method:** Read public pages and documentation; compare with the actual locally available source for Zrain Tools v1.2. This is **not** a security audit, full browser regression test, or independently verified assessment of all 50 Nhako processing engines.

## Verified findings, grouped by product

### Nhako main website — https://nhako.com/
- A portfolio/business hub that describes website, web system, mobile app, and UI/UX services, alongside independent products.
- Distinguishes live releases from a planned product. It describes three products as live and Beam as planned.
- Project-specific landing pages document real purpose, stacks, constraints, links to source, and the live product.
- **Useful for Zrain:** retain `zrain.web.app` as the central product-discovery and portfolio hub. Give each Zrain product a clear story, correct limitations and one obvious action. Do not turn Zrain into an agency or add invented pricing.

### Nhako Tools — https://tools.nhako.com/ and https://nhako.com/projects/tools
- One brand/product with 50 tools, grouped as 24 PDF, 11 Image, 4 Media, 9 Developer and 2 Calculators, with a Malaysia-oriented page.
- Search covers tool names and jobs; favourites stay in that browser; bilingual English/Malay UI, quick starters, dark mode, and installable progressive web app (PWA).
- No user-account requirement and a browser-centric processing strategy. The official documentation says file data is handled locally; selected advanced models, libraries or remote-control features may still download assets or use third-party network services.
- The documented technical architecture uses a single tool registry; prerendered routes with a static Astro frontend; Preact tool islands; lazy-loaded processing engines; workers for CPU-heavy tasks; test suites for accessibility and interaction.
- Important honest limitations: lossless PDF compression may save little; strong scan compression loses selectable text; Office conversion may need a large LibreOffice WebAssembly download and considerable memory. A polished interface does not remove these tradeoffs.
- **Useful for Zrain:** make the task easier to discover, use favourites without login, show practical entry points, and put limitations where users will see them.

### NhakoSearch — https://nhako.com/projects/search and https://search.nhako.com/
- A separate cozy word-search game, rather than another page of the Tools product.
- Publicly described features include daily puzzle, 360 level path, difficulty/themes, multiplayer race/co-op, friends, achievements and a deliberately distinct visual language.
- Uses Next.js, React, Supabase, row-level security and Realtime for multiplayer; authentication and storage are relevant to those features.
- **Useful for Zrain:** brand consistency can coexist with product-specific game art and UX. No reason to rewrite existing Guess The Flag or Memory Rush simply because another game has a different mechanic.

### NhakoCapture — https://nhako.com/projects/capture and Chrome Web Store listing
- A separately published Chrome-family browser extension (Manifest V3), not a generic file-conversion feature.
- Captures selected areas or whole pages, overlays pen/arrow/highlight/blur/text, and supports quick copy/save without a separate editor tab.
- The project emphasizes explicit invocation, minimal permissions and no account/telemetry. Public store listing is consistent with the stated high-level functionality.
- **Useful for Zrain:** a potential **new separate project** in future if requested. Building a trustworthy extension involves permissions, review, browser-level testing and privacy considerations. Not something to insert invisibly into the existing web utilities.

### Nhako Beam — https://nhako.com/projects/beam
- **Specification only, not a released application.** Proposed direct P2P transfer using Rust, QUIC, Tauri/Kotlin and encrypted relays when direct transfer fails.
- **Useful for Zrain:** practice describing planned work accurately. Do not list an unbuilt Zrain equivalent as production-ready.

## Decision: keep Zrain's own design and product hierarchy

Preserve the official Zrain logo, `@zrain/ui`/brand files, Cozy Bento/Cozy Clay treatment, `Developed by Zrain`, and exactly **“Made for people. Built with purpose.”** in the footer. Keep **“Explore the Zrain Ecosystem.”** separate from the tagline. Do not copy Nhako logos, artwork, copywriting or code.

**Zrain Ecosystem should show five products, not 28 separate catalogue entries:**

| Public product | Included features | Number |
|---|---|---:|
| Zrain Image Tools | Convert, inspect, enhance, edit, create | 13 |
| Zrain PDF Tools | Edit additions, organizer, watermark | 3 |
| Zrain Document Tools | File converter, OCR, compare, CSV | 4 |
| Zrain Developer Tools | JSON, Markdown, QR, passwords, UTM | 5 |
| Zrain Productivity Tools | Invoice, text, focus timer | 3 |

All remain account-free. Each has a deployable static website folder and can be presented as one product in the Ecosystem catalogue.

## Changes actually implemented in Zrain Tools v1.3

1. **Task-first search:** Search by function, description and local English/Malay synonyms; available on the collection landing page and each product page. `Ctrl+K` focuses search; on a tool page it opens a search dialog scoped to that independent product.
2. **Favourite tools:** Star tools from search, quick starts or tool pages. Uses `localStorage`, no login or database. Stored per **website origin and browser**: if independent products use different domains, these preferences do **not** sync across them.
3. **Recently used tools:** A bounded 8-item history, with up to five suggestions shown in the matching product. Only local identifiers are stored, not uploaded filenames or file contents.
4. **Quick starts:** Common tasks on the catalog pages so users need not learn product categories before acting.
5. **Visible privacy/limitations:** Information panel explains locally processed files, externally fetched software/fonts, PDF-fidelity limits, and limits of simple image upscaling.
6. **Testing and architecture:** New `discovery.mjs` is pure testable business logic; `discovery-ui.mjs` owns interactions; the existing catalogue continues to be the source of truth. Tests cover synonyms, category boundaries, favourites, storage failures, recent history and page assets.

The version deliberately retains existing Zrain UI and all 28 existing tools. **This release does not replace the PDF/Word conversion engine, add AI super-resolution, deliver bilingual translation of all processing forms, make every feature work offline, or create a browser extension.** Those would need their own implementation and quality checks.

## Product priorities after research

| Priority | Improvement | Reason | Status |
|---|---|---|---|
| P0 | Correct PDF-to-Word fidelity and meaningful table layout handling | Current extraction may ruin a carefully formatted CV | **Not solved in v1.3**; advanced engine + realistic fixture tests needed |
| P0 | Real image enhancement, not simply pixel resizing | A 1920×1080 output can remain blurred | **Not solved in v1.3**; model-based upscaling should be separately evaluated |
| P0 | Chrome/Edge/mobile end-to-end tests for each of the 28 flows | Previous results are not a substitute for user workflows | **Partially tested**: Node and HTTP; browser automation blocked by environment |
| P1 | Find a tool using English/Malay task phrases | Users come with problems, not product categories | **Implemented** |
| P1 | Save favourites without a login | Frequent utilities should be easy to revisit | **Implemented locally** |
| P1 | Quick starts and honest caveats | Shorter routes and fewer misleading expectations | **Implemented** |
| P2 | Full Malay/English UI toggle | Useful to Malaysian users; significant translation/QA work | **Not implemented**; only bilingual search synonyms |
| P2 | Self-host PDF, font and OCR dependencies; optional offline PWA | Reduces network dependencies | **Not implemented** |
| P2 | Isolate heavy processing in Workers/lazy load | Better responsiveness for large PDFs/media | **Not implemented** |
| Separate product | Screenshot browser extension | Distinct distribution/security model | **Idea only**; do not imply existence |
| Separate product | P2P file transfer | Complex encryption/NAT/discovery/relay | **Idea only**; Nhako Beam itself is specification-only |

## Deployment and user acceptance

Do not update production Firebase/GitHub/Ecosystem until all intended features pass real Chrome tests on the user's Windows machine. At minimum: navigate all five root pages; try Malay/English search; save/un-save favourites and reload; test tool-to-tool switching; import real JPG/PNG/WebP and output downloads; test PDF pages and complex sample documents; verify OCR and external network dependencies; inspect with Chrome DevTools for any unexpected file-upload requests; test keyboard focus, mobile layout and error messages.

The previous Zrain v1.2 browser-runner attempt and the v1.3 attempt returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` when opening localhost. This is an **unresolved test-environment limitation**, not evidence that a particular browser function has passed or failed on the user's device.

## Sources (official/public)
- https://nhako.com/
- https://nhako.com/projects/tools
- https://tools.nhako.com/
- https://github.com/kimzam30/Nhako-tools
- https://nhako.com/projects/search
- https://search.nhako.com/
- https://nhako.com/projects/capture
- https://chromewebstore.google.com/detail/nhakocapture/jappjdkoignhbjjlemegflaleoeebpln
- https://nhako.com/projects/beam

This file is an independent analysis and implementation record, not an endorsement by or affiliation with Nhako.
