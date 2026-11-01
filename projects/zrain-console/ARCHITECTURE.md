# How Zrain Console works

Zrain Console is the **frontend viewing layer** inside the Zrain Ecosystem. Each featured product remains its own separate application.

## The live flow

    Zrain Ecosystem product cards
         |
         +-- Primary button has data-console="product-id"
              |
              +-- public/zrain-console.js checks known products
                   |
                   +-- HTML dialog + iframe
                   +-- Mobile or Desktop viewing mode
                   +-- Refresh, fullscreen, close
                   +-- Open original app in new tab

The published product directory comes from the existing Cloudflare Worker and KV storage; there is no extra Console backend.

## Design choices

1. **One viewer, original applications.** Games, services and developer showcases remain independently deployed.
2. **Small web stack.** Plain HTML, CSS, JavaScript, native dialog, iframe, and ResizeObserver.
3. **Known product IDs.** Deep-link demonstrations accept recognized built-in IDs, not arbitrary iframe URLs.
4. **Mobile and Desktop modes.** The 390-by-844 mobile virtual viewport fits to the available space. Desktop uses a wide CSS viewport scaled to fit.
5. **Preserve app state.** Changing views does not reload the existing iframe. Refresh explicitly reloads it.
6. **Zrain UI showcase exception.** Trusted local same-origin HTML is displayed via srcdoc to avoid a problematic secondary iframe navigation.
7. **Respect iframe restrictions.** Other apps may disallow embedding via their browser security headers. The fallback is Open in new tab.

## Source map

- src/zrain-console.js: snapshot of Ecosystem public/zrain-console.js
- src/console-products.js: snapshot of Ecosystem public/console-products.js
- src/zrain-console.css: extracted Console section from Ecosystem public/style.css

The full host dialog HTML, images, and regression tests remain in [zrain03/zrain-ecosystem](https://github.com/zrain03/zrain-ecosystem). These snapshots help review the real source but are not a drop-in standalone package.
