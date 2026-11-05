<!--
Fail / File: tool-runtime/docs/v1.7-reference/MANUAL-ACCEPTANCE.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Manual acceptance checklist — Zrain Tools v1.5 untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Manual acceptance checklist — Zrain Tools v1.5 reference for maintenance and auditable release decisions.
-->

# Manual acceptance checklist — Zrain Tools v1.5

These are manual checks **still required before publication**. Do not confuse browser initialization with complete export verification.

For every tool, first check: Zrain logo/header/footer, description/steps/result/limitations, upload preview, controls/help text, responsive mobile layout, disabled/error handling, file download and whether the output can be opened.

| Public product | Tool | One concrete release check |
|---|---|---|
| Zrain Image Tools | Image Converter | Convert a transparent WebP and compare its exported PNG/JPG transparency and quality. |
| Zrain Image Tools | Image Inspector | Inspect JPEG with EXIF and PNG without EXIF; verify SHA-256 and file signature fields. |
| Zrain Image Tools | Color Inspector | Click a known red pixel and compare HEX/RGB; verify white/black contrast. |
| Zrain Image Tools | Image Compare | Compare an identical pair, a slightly compressed copy and an intentionally changed pair; interpret red/grey. |
| Zrain Image Tools | Image Enhancer | Choose an intentionally blurry photo, export Full HD, and compare at 100% zoom; verify no false detail promises. |
| Zrain Image Tools | Background Remover | Remove a flat-color background, then try a complex photograph and evaluate unwanted foreground loss. |
| Zrain Image Tools | Image Cropper | Crop using X/Y/width/height on a known-size picture and check the exported dimensions. |
| Zrain Image Tools | Watermark | Apply translucent text to a photo and confirm position/opacity in the new PNG. |
| Zrain Image Tools | Collage Maker | Drop four photos; verify tile crop, columns and spacing, and download output. |
| Zrain Image Tools | Pixel Art | Try two block sizes and confirm that the style visibly changes. |
| Zrain Image Tools | Emoji Art | Generate with two emoji sets and two tile densities; check artwork displays on your device. |
| Zrain Image Tools | Icon Maker | Generate a ZIP from a square logo; inspect all eight PNG dimensions after extracting. |
| Zrain Image Tools | Image To Ascii | Generate with both character palettes; open the saved text in a monospace editor. |
| Zrain PDF Tools | Pdf Editor | Open a multi-page PDF, add text to page 2, export and check position in Chrome/Adobe. |
| Zrain PDF Tools | Pdf Watermark | Apply a translucent watermark to a multi-page PDF and verify every page. |
| Zrain PDF Tools | Pdf Organizer | Merge two PDFs, reorder, rotate and remove pages, then export and inspect page count/order. |
| Zrain Document Tools | File Converter | Test both PDF→Word modes, PDF→Excel tables, DOCX→print/PDF and PNG→PDF; compare original/exported layouts. |
| Zrain Document Tools | Text Extractor | Try English and Malay screenshots; compare OCR with real text and correct any errors. |
| Zrain Document Tools | Compare | Compare two text files with a changed date and amount; examine the conclusion. Repeat on DOCX/PDF. |
| Zrain Document Tools | Csv Cleaner | Use CSV with quoted commas and duplicate lines; verify row counts and output in spreadsheet software. |
| Zrain Developer Tools | Json Studio | Paste valid JSON, then malformed JSON; test Format, Validate and Minify modes. |
| Zrain Developer Tools | Markdown Editor | Edit headings, bullets, bold and code; check live preview and downloaded .md. |
| Zrain Developer Tools | Password Generator | Toggle all allowed character classes; confirm requested length and copy behavior. |
| Zrain Developer Tools | Qr Generator | Enter a URL, generate different foreground/background colors, then scan using a phone. |
| Zrain Developer Tools | Utm Builder | Build a link with a pre-existing query string; check preserved params and final destination. |
| Zrain Productivity Tools | Invoice Generator | Enter several invoice items and tax, export PDF, verify totals and page layout. |
| Zrain Productivity Tools | Text Tools | Test trimming, case changes, duplicate removal, sorting, reverse and word counting. |
| Zrain Productivity Tools | Focus Timer | Start, pause, resume, reset, switch modes, reload tab and check completed-session persistence. |

For PDF/Office/OCR: have a working internet connection, check the browser console for blocked CDN/CSP requests, and use at least one real representative input file. For Image Enhancer, never equate a larger pixel count with authentic recovered details.

**Deployment sequence:** confirm each product separately → deploy its website on its own host → verify real URL → create Draft Ecosystem item → publish only that checked item.
