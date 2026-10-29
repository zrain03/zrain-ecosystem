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
- Firebase Hosting remains site `zrain` in project `zrain-ecosystem`. Zrain UI is pinned to the official-tagline commit `37a699a9e23fb9f023c049d3129206aafc660830`.

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
