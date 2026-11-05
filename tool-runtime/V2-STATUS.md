<!--
Fail / File: tool-runtime/V2-STATUS.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Zrain Tools v2 — alpha 1, 2 November 2026 untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Zrain Tools v2 — alpha 1, 2 November 2026 reference for maintenance and auditable release decisions.
-->

# Zrain Tools v2 — alpha 1, 2 November 2026

**Status: working source preview, not a production release.** No existing Cloudflare Pages sites should be overwritten with this build until local browser and real-file acceptance tests pass.

## Scope delivered

- Starting point: 28 distinct tools in the five independent Zrain Tools v1.7 websites.
- New code-backed tool pages: 20 (see below).
- Total: **48 distinct tool functions** in five website families.
- `npm run check`: **59/59 Node tests passed** in the preparation environment.
- The five `dist/` directories build; this does **not** establish that every export works end to end.
- Browser E2E and live upload/download smoke tests are **not verified** in this environment: browser navigation was blocked, and heavyweight PDF dependencies may be fetched from external CDNs.

### 20 new functions

| Family | New tools |
|---|---|
| Developer (6) | Base64 tool; JWT decoder (no signature verification); word counter; SHA hash generator; UUID v4/v7 generator; CSS shadow generator |
| Image (3) | Image resizer; image rotator/flipper; image compressor |
| PDF (10) | Merge PDF; split PDF; rotate PDF; crop PDF; remove PDF pages; extract PDF pages; PDF-to-text; PDF-to-image; JPG/PNG-to-PDF; PDF page numbers |
| Productivity (1) | Basic teleprompter with adjustable scroll, mirror, pause and reset |

The additions do actual work in the browser, not placeholder download buttons; however, they require interactive acceptance on each supported browser and real output validation before release. Existing v1.7 functionality has not been completely retested against real documents after these modifications.

## Parity benchmark: Nhako Tools

The current source benchmark has **50 distinct tool entries**, of which 2 are calculators. The user's target is to meet or exceed all 48 non-calculator functions and retain 17 unique Zrain tools, a proposed **65-tool** goal. This alpha has 48 total functions and **does not have 48/48 Nhako parity**, because several of those 48 are Zrain's unique tools and advanced behavior is missing.

Major capabilities not yet equivalent to Nhako include password protect/unlock PDF, repair PDF, searchable OCR PDFs, PDF to Word/PowerPoint, Office to PDF via LibreOffice, scanned document correction, background removal through segmentation AI, HEIC import, photo metadata stripping, passport photo maker, video compression/extraction, Whisper transcription, and teleprompter remote/recording/voice-follow. Their absence must not be hidden by misleading counts.

## Required quality gates before public launch

1. Live browser testing on Chromium desktop, Firefox and mobile screen sizes, with keyboard and touch.
2. Real-file output checks for every file tool: validate PDFs independently (PDF.js/pdfinfo), verify page counts/text, image dimensions/alpha/quality, no blank exports, and compare source versus output.
3. Check security/privacy: no credentials bundled; JWT is decoded locally without trust claims; PDF crop is not redaction; user files stay on device for local tools unless explicitly disclosed otherwise.
4. Check model/runtime download sizes, CDN reliability, browser memory, cancellation, and format support.
5. Review all dependencies' and borrowed-code licenses; preserve applicable third-party notices.
6. Update official catalog only after each product passes regression and acceptance tests.

## Local setup (Node.js 20.11+)

```
npm run check
npm start
```

Open the localhost address displayed by the server; the existing five website families are served from the built `dist/` hierarchy. Run the build again after editing source. Do not deploy this alpha over live v1.7.

Brand: **Zrain**. Official footer tagline: **Made for people. Built with purpose.**
