<!--
Fail / File: tool-runtime/docs/v1.7-reference/ECOSYSTEM-PUBLISHING.md
Pembangun / Developer: Zrain
Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
Dikemas kini / Last updated: 2026-11-05
BM: Menyediakan rujukan Adding five Zrain products to the Zrain Ecosystem catalog untuk penyelenggaraan serta keputusan release yang boleh diaudit.
EN: Provides Adding five Zrain products to the Zrain Ecosystem catalog reference for maintenance and auditable release decisions.
-->

# Adding five Zrain products to the Zrain Ecosystem catalog

**This package has not modified the live catalog.** Create these as **separate Draft records** until hosting URLs and browser functions are verified. Categories are based on the existing public Ecosystem structure, not newly invented categories.

| Name | Category | Suggested slug / deployment project |
|---|---|---|
| Zrain Image Tools | Online Services | `zrain-image-tools` |
| Zrain PDF Tools | Online Services | `zrain-pdf-tools` |
| Zrain Document Tools | Online Services | `zrain-document-tools` |
| Zrain Developer Tools | Developer Tools | `zrain-developer-tools` |
| Zrain Productivity Tools | Online Services | `zrain-productivity-tools` |

Every item uses the **official existing Zrain logo** and credits **Developed by Zrain** with the exact footer tagline **Made for people. Built with purpose.** Do not insert the tagline into the header.

## Descriptions (ready to paste in the Ecosystem admin form)

### Zrain Image Tools — Online Services

Convert JPG, PNG and WebP images, inspect colors and metadata, compare pictures, crop, watermark and create collages or emoji artwork in your browser. No account is required. Image enhancement uses resizing, sharpening and smoothing; it cannot guarantee recovery of genuine lost detail.

### Zrain PDF Tools — Online Services

Add new text to PDF pages, rearrange and merge PDF pages, and apply text watermarks without creating an account. The tools edit page arrangements or add annotations, but do not directly replace existing embedded PDF text. Some features download processing libraries when used.

### Zrain Document Tools — Online Services

Convert supported PDF, DOCX and image files, extract image text, compare documents by their text and clean CSV rows. Each conversion mode explains whether it prioritizes appearance or editable content. Complex formatting and PDF table extraction are not guaranteed.

### Zrain Developer Tools — Developer Tools

Format and validate JSON, write Markdown with instant preview, generate QR codes and strong random passwords, and create UTM campaign URLs. Simple browser-first utilities that work without an account.

### Zrain Productivity Tools — Online Services

Create basic PDF invoices, transform or clean text, and organize study or work sessions with a focus timer. No login is required; completed focus sessions are saved in the current browser rather than synced between devices.

## Publishing order

1. Run the full local build and tests: `npm run check`.
2. Verify a chosen product with real files in Chrome, desktop and mobile. Use `MANUAL-ACCEPTANCE.md`.
3. Deploy the **contents** of that product's standalone website folder on its own static hosting destination (for example, a separate Firebase Hosting site). Do not overwrite any existing Zrain hosting project unless specifically intended.
4. Open the resulting real URL. Check every utility in the product, the logo, back/home links, footer, responsive layout and privacy language. Confirm the pages' script/library dependencies load successfully.
5. Create or edit the corresponding **Draft** Ecosystem catalog entry. Fill name, category, accurate description, logo, and *verified actual* website URL.
6. Publish that single entry only after manual QA succeeds. Repeat independently for the next product.

`dist/ECOSYSTEM-ENTRIES.json` contains structured draft metadata, not a direct API import schema for the protected admin system. **No hosting URLs are invented**; set those only after real deployment.
