<!--
Fail / File: tool-runtime/README.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Tools v2 · Alpha 1 untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Tools v2 · Alpha 1 reference for maintenance and auditable release decisions.
-->

# Zrain Tools v2 · Alpha 1

**Developed by Zrain** — *Made for people. Built with purpose.*

Browser-first utility collection, evolving from the five independent v1.7 products. **This folder is a working preview, not production.** The existing v1.7 Cloudflare Pages sites stay unchanged.

## Contents

- 48 code-backed browser tools: 28 inherited v1.7 utilities and 20 new v2 alpha functions.
- Five exportable static family websites: Image, PDF, Document, Developer and Productivity.
- Source in `src/`, Node tests in `tests/`, built static sites in `dist/`.
- Full feature, limitation and acceptance status: [V2-STATUS.md](V2-STATUS.md).
- Previous release notes and guides are preserved for reference in `docs/v1.7-reference/`. Those deployment instructions are **not for v2**.

## Run locally on Windows (Node.js 20.11+)

Open PowerShell in this folder:

```powershell
npm run check
npm start
```

Open the printed `http://127.0.0.1:8080/` URL in your browser. It contains links to the five tool families and all the individual tools. Run `npm run build` after editing source.

The 48 code-backed pages are **not** a claim of parity with Nhako's 50 tools or a verified public release. Advanced PDF, image, AI and media functionality remains to be built and tested. See `V2-STATUS.md` for details and no-publish conditions.

Do not directly overwrite any production Cloudflare site with this alpha. Do not commit or expose credentials. Local JWT decode never verifies signatures; PDF cropping does not remove hidden content.
