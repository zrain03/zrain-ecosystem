<!--
Fail / File: README.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Panduan produk dan langkah release yang memisahkan source tempatan daripada production.
EN: Product and release guidance separating local source from production.
-->

## Persona + regression release review (5 November 2026)

- **BM:** 263 fail source diinventori; 159 fail dengan header BM/EN dan 104 pengecualian yang dijelaskan dalam `FILE_PROVENANCE.json`. Tiga fail berlesen pihak ketiga kekal tanpa disunting.
- **EN:** 263 source files are inventoried; 159 have BM/EN headers and 104 documented exclusions. Three third-party licensed files remain untouched.
- **BM:** Ujian lama tidak dibuang: 43 ujian disesuaikan untuk kontrak 58/11 dan disertakan dalam `npm run test:release`.
- **EN:** Historical tests were not discarded: all 43 now cover the current 58/11 contract and run in `npm run test:release`.
- **BM:** `tool-runtime/dist/` ialah output build, bukan source Git. Jangan padam `public/tools/`, ia diperlukan untuk Firebase Hosting.
- **EN:** `tool-runtime/dist/` is rebuildable output, not Git source. Do not delete `public/tools/` because Firebase Hosting uses it.
- **BM:** Pakej ini ialah calon release untuk branch review sahaja, tidak melakukan deploy. Semak CI Java/PostgreSQL dan paparan browser sebenar sebelum menggabung ke `main`.
- **EN:** This is a review-branch candidate, not a deployment. Verify Java/PostgreSQL CI and real-browser UI before merging to `main`.

**Commands / Arahan:** `npm ci`, `npm run test:release`, kemudian `cd backend` dan `./mvnw -B clean verify` pada Unix atau `mvnw.cmd -B clean verify` pada Windows.

## Zrain Ecosystem 58/11 Golden Reference release candidate (2026-11-05)

- **BM:** Source kini mempunyai 58 entri (10 projek, 48 browser tools), disusun mengikut 11 kategori rasmi daripada `public/categories/category-data.mjs`.
- **EN:** Source now contains 58 entries (10 projects, 48 browser tools), grouped under the 11 canonical categories in `public/categories/category-data.mjs`.
- **BM:** Senarai panjang memaparkan lima baris sebelum scroll tanpa label atau butang tambahan. Data Worker Published masih berautoriti selepas refresh berjaya.
- **EN:** Long lists display five rows before scrolling without additional labels or buttons. Published Worker data remains authoritative after a successful refresh.
- **BM:** Shared UI menggunakan pin `a109401fa591afa9f66479fa8d86f1ed1679d70b` dan salinan byte-for-byte.
- **EN:** Shared UI uses pin `a109401fa591afa9f66479fa8d86f1ed1679d70b` with byte-for-byte copies.
- **BM:** Pakej patch perlu disemak dan diuji pada Windows sebelum perubahan GitHub atau deployment.
- **EN:** Review and test the patch on Windows before GitHub changes or deployment.
- **BM:** URL Zrain Community merujuk repo rasmi kerana laman public tersendiri belum disahkan; URL Zrain Gifts menggunakan endpoint Worker yang dibekalkan dalam rekod pengguna dan perlu pengesahan live.
- **EN:** Zrain Community points to its official repo because no separate public website was verified; Zrain Gifts uses the Worker endpoint supplied in user records and requires live verification.

# Zrain Ecosystem v4.1.0

Official hub: https://zrain.web.app

**Official tagline:** Made for people. Built with purpose.

**Supporting line:** Explore the Zrain Ecosystem.

## What's new

- Zrain Console opens every **currently hosted Zrain web app** in a native browser `dialog` within the ecosystem site. **All apps start in Mobile View**, including Zrain Links and Auth Starter. Choose **Desktop View** only when you want a wide browser preview. On a phone, Desktop View simulates a 1100px desktop viewport and scales the resulting website to fit, so text appears smaller but responsive desktop layouts are actually visible. Switching views preserves the iframe rather than reloading the application.
- The Console uses the full available browser viewport, rather than a scrollable overlay. At 100% browser zoom, the portrait iframe is proportionally fitted to the available stage. Because the application runs on a separate origin, Console cannot override responsive breakpoints, scrolling behavior, or `X-Frame-Options` / `Content-Security-Policy` set by that application.
- Real Guess the Flag and Memory Rush icons are derived from images supplied by Zrain. Other projects retain the official Zrain brand mark.
- An always-visible **Open in new tab** option is provided for sites with frame or authentication restrictions.
- Unreleased project ideas are excluded. Zrain UI is a source code repository, not a hosted web app, so it links directly to GitHub.
- The design stays light, with cream, terracotta, Inter and Bento sections. No em dash punctuation is used.
- Firebase Hosting remains site `zrain` in project `zrain-ecosystem`. Zrain UI is pinned to Golden Reference `a109401fa591afa9f66479fa8d86f1ed1679d70b` in this release candidate.

## Historical v4.1 instructions (not the current release procedure)

The instructions below describe an earlier version; **use the guarded 58/11 release kit above**, not an old v4.1 auto-deploy script.

## Update the existing production project

Download the v4.1 patch ZIP and extract it to a separate folder. Run `Install-Zrain-Ecosystem-v4.1.ps1` from the extracted ZIP. This script requires the existing v4 project, checks its Firebase configuration, backs up all files it will replace, copies only the changed v4.1 website, metadata, README and test files, runs dependency installation, Zrain UI sync and automated tests, checks the Firebase Hosting site and deploys to `zrain.web.app` only if checks pass.

The installer **does not** overwrite `firebase.json`, `.firebaserc`, `public/zrain-ui.js`, `public/brand.css` or Firebase database/authentication resources. No changes to Zrain Links, Auth Starter, Guess the Flag or Memory Rush repositories are made.

## Local commands after initial installation

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem"
npm install
npm run ui:sync
npm run test:release
.\deploy.ps1 -ProjectId zrain-ecosystem
```

## URLs

| Product | Embedded website |
| --- | --- |
| Guess the Flag | https://guesstheflag-zrain.web.app/ |
| Memory Rush | https://memoryrush-zrain.web.app/ |
| Zrain Links | https://zrain-links.web.app/ |
| Zrain Auth Starter | https://zrain03.github.io/zrain-auth-starter/ |

Iframe availability and sign-in success depend on the app's own hosting and browser policies. Opening the site in a new tab is the fallback. This package does not include the game web builds or their server sources.
