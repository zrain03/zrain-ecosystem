# Zrain Console

**Explore apps without leaving the ecosystem.**

Zrain Console is the responsive viewing experience used across the [Zrain Ecosystem](https://zrain.web.app). Visitors can preview official games and web apps while each product keeps its own independent website, authentication, and backend.

**Developed by Zrain**  
*Made for people. Built with purpose.*

## Live demo

- [Explore the Zrain Console project page](https://zrain.web.app/zrain-console.html)
- [Play Guess The Flag](https://zrain.web.app/?console=guess-the-flag)
- [Open Zrain Links](https://zrain.web.app/?console=zrain-links)
- [View Zrain UI Showcase](https://zrain.web.app/?console=zrain-ui)

Each demo launches the actual Zrain Console in the Ecosystem. There is no duplicate demo app.

## Features

- Mobile and Desktop viewport switching without resetting the app
- Reload, fullscreen, close, and Open in new tab
- Google Play badge for supported games
- Accessible native HTML dialog and focus restoration
- Static product fallback plus published product catalog
- Local same-origin preview for Zrain UI Showcase
- No shared accounts or additional backend

## Repository files

| File | What it contains |
| --- | --- |
| src/zrain-console.js | Production Console controller snapshot |
| src/console-products.js | Built-in product definitions |
| src/zrain-console.css | Console-specific styles extracted from the Ecosystem |
| docs/ARCHITECTURE.md | Explanation of the implementation and limits |

The maintained production implementation is in [zrain03/zrain-ecosystem](https://github.com/zrain03/zrain-ecosystem). The source files here are an **exported snapshot** of that working feature. They depend on the host HTML and assets and are not advertised as a standalone npm package.

## Integration example

An Ecosystem product card uses a known product ID such as:

    <button type="button" data-console="memory-rush">Play Now</button>

The Console resolves the ID to a trusted product and opens its existing web app in an iframe. Deep links such as https://zrain.web.app/?console=zrain-links accept only known built-in product IDs, never arbitrary website URLs.

## Use and limitations

The public demo runs on Zrain Ecosystem, so no installation is needed. For the full runnable website and release tests, see [the Ecosystem source](https://github.com/zrain03/zrain-ecosystem).

Some apps or identity providers forbid iframe embedding. Zrain Console respects their security policies and provides **Open in new tab**. It never bypasses an app's login or merges its data.

## Contact

[zrain.dev@gmail.com](mailto:zrain.dev@gmail.com)
