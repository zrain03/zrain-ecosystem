/*
 * Fail / File: public/ecosystem-inventory.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (earliest source date unavailable)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Inventori projek dan 46 Tools rasmi v2.4 yang digunakan oleh homepage, carian, Console serta Admin.
 * EN: Unified project and official v2.4 46-tool inventory for homepage, search, Console and Admin.
 */
import {CATEGORIES as TAXONOMY,slugify,validateTaxonomy} from './categories/category-data.mjs';
const SOURCE = Object.freeze([
  {
    "id": "guess-the-flag",
    "name": "Guess The Flag",
    "repoUrl": "https://github.com/zrain03/guess-the-flag",
    "description": "Learn countries and flags with 190 flags and practice modes.",
    "category": "games",
    "kind": "project",
    "url": "https://guesstheflag-zrain.web.app/",
    "keywords": "flag geography quiz game bendera tebak negara"
  },
  {
    "id": "memory-rush",
    "name": "Memory Rush",
    "repoUrl": "https://github.com/zrain03/memory-rush",
    "description": "Grid, Number and Pattern Recall memory games.",
    "category": "games",
    "kind": "project",
    "url": "https://memoryrush-zrain.web.app/",
    "keywords": "games recall grid number pattern memorise mengingat game"
  },
  {
    "id": "zrain-auth-starter",
    "name": "Zrain Auth Starter",
    "repoUrl": "https://github.com/zrain03/zrain-auth-starter",
    "description": "Java Spring Boot JWT authentication developer demo and template.",
    "category": "infrastructure",
    "kind": "project",
    "url": "https://zrain03.github.io/zrain-auth-starter/",
    "keywords": "jwt auth login java spring security api backend"
  },
  {
    "id": "zrain-ui",
    "name": "Zrain UI",
    "repoUrl": "https://github.com/zrain03/zrain-ui",
    "description": "Shared design system and component showcase.",
    "category": "infrastructure",
    "kind": "project",
    "url": "https://zrain.web.app/zrain-ui-showcase.html",
    "keywords": "design components brand user interface ui css"
  },
  {
    "id": "zrain-console",
    "name": "Zrain Console",
    "repoUrl": "https://github.com/zrain03/zrain-console",
    "description": "Open Zrain applications in a unified workspace.",
    "category": "monitoring",
    "kind": "project",
    "url": "https://zrain.web.app/zrain-console.html",
    "keywords": "preview explore apps web application console"
  },
  {
    "id": "zrain-links",
    "name": "Zrain Links",
    "repoUrl": "https://github.com/zrain03/zrain-links",
    "description": "Create short links, QR previews and visits links.",
    "category": "links",
    "kind": "project",
    "url": "https://zrain-links.web.app/",
    "keywords": "shorten url link pendek pautan visits qr"
  },
  {
    "id": "zrain-monitor",
    "name": "Zrain Monitor",
    "repoUrl": "https://github.com/zrain03/zrain-monitor",
    "description": "Monitor uptime and public HTTPS services.",
    "category": "monitoring",
    "kind": "project",
    "url": "https://zrain-monitor.web.app/",
    "keywords": "uptime monitor server website status api keep awake ping"
  },
  {
    "id": "zrain-ai",
    "name": "Zrain AI",
    "description": "Public multilingual assistant using Cloudflare AI.",
    "category": "ai",
    "kind": "project",
    "url": "https://zrain-ai.web.app/",
    "repoUrl": "https://github.com/zrain03/zrain-ai",
    "keywords": "chat assistant multilingual ai chatbot"
  },
  {
    "id": "zrain-community",
    "name": "Zrain Community",
    "description": "Product-specific public feedback and moderation integration.",
    "category": "infrastructure",
    "kind": "project",
    "url": "https://zrain-community.web.app/",
    "repoUrl": "https://github.com/zrain03/zrain-community",
    "keywords": "feedback community moderation API github"
  },
  {
    "id": "zrain-gifts",
    "name": "Zrain Gifts",
    "description": "Developer portfolio and digital gifting platform, with payment features subject to release status.",
    "category": "links",
    "kind": "project",
    "url": "https://zrain-gifts.zrain-dev.workers.dev/",
    "repoUrl": null,
    "keywords": "developer portfolio tips gifts digital presence"
  },
  {
    "id": "watermark",
    "name": "Add Image Watermark",
    "description": "Add text watermarks to images.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/watermark/",
    "keywords": "Add text watermarks to images. image Export watermarked images as PNG. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "background-remover",
    "name": "Background Remover",
    "description": "Remove the image background with private, on-device AI.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/background-remover/",
    "keywords": "Remove the image background with private, on-device AI. image The AI model downloads on first use; review fine details and transparent edges. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "collage-maker",
    "name": "Collage Maker",
    "description": "Arrange your images into a collage.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/collage-maker/",
    "keywords": "Arrange your images into a collage. creative Export one combined PNG. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "color-inspector",
    "name": "Color Picker & Inspector",
    "description": "Pick a color from an image and inspect HEX, RGB and contrast.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/color-inspector/",
    "keywords": "Pick a color from an image and inspect HEX, RGB and contrast. image HEX, RGB, HSL, CMYK and contrast. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-compare",
    "name": "Compare Images",
    "description": "Compare two images to see visual differences.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-compare/",
    "keywords": "Compare two images to see visual differences. image Pixel differences are not necessarily mistakes. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-compressor",
    "name": "Compress Image",
    "description": "Make a smaller image file and review the result before download.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-compressor/",
    "keywords": "Make a smaller image file and review the result before download. image Only offers a download when the encoded result is smaller. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "text-extractor",
    "name": "Extract Text from Image",
    "description": "Read text from images using OCR.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/text-extractor/",
    "keywords": "Read text from images using OCR. text Recognition may be imperfect and initially needs internet access. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-converter",
    "name": "Image Converter",
    "description": "Convert JPG, PNG and WebP images.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-converter/",
    "keywords": "Convert JPG, PNG and WebP images. image Convert locally; format support depends on your browser. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-cropper",
    "name": "Image Cropper",
    "description": "Crop an image and preview the result.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-cropper/",
    "keywords": "Crop an image and preview the result. image Drag the crop box or enter exact pixel coordinates. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-enhancer",
    "name": "Image Enhancer",
    "description": "Upscale toward HD, Full HD or 4K dimensions and improve visible edges.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-enhancer/",
    "keywords": "Upscale toward HD, Full HD or 4K dimensions and improve visible edges. image Enhancement cannot restore details absent from the original image. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-inspector",
    "name": "Image Metadata Viewer",
    "description": "View embedded image properties and technical metadata.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-inspector/",
    "keywords": "View embedded image properties and technical metadata. image File information stays on your device. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-to-ascii-art",
    "name": "Image to ASCII Art",
    "description": "Create text-character art from an image.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/image-to-ascii-art/",
    "keywords": "Create text-character art from an image. creative Preview character art and export PNG, PDF or TXT. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-to-binary-art",
    "name": "Image to Binary Art",
    "description": "Create a 0-and-1 artwork from an image.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/image-to-binary-art/",
    "keywords": "Create a 0-and-1 artwork from an image. creative Export PNG and PDF, with optional TXT. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-to-block-art",
    "name": "Image to Block Art",
    "description": "Create shaded character-block artwork from an image.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/image-to-block-art/",
    "keywords": "Create shaded character-block artwork from an image. creative Export PNG and PDF, with optional TXT. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "emoji-art",
    "name": "Image to Emoji Art",
    "description": "Transform an uploaded image into artwork using emojis you choose.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/emoji-art/",
    "keywords": "Transform an uploaded image into artwork using emojis you choose. creative Choose your own emoji set; export PNG or PDF. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pixel-art",
    "name": "Image to Pixel Art",
    "description": "Turn an image into pixel-style artwork.",
    "category": "art",
    "kind": "tool",
    "url": "/tools/pixel-art/",
    "keywords": "Turn an image into pixel-style artwork. creative Preview pixel art and export PNG or PDF. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-resizer",
    "name": "Resize Image",
    "description": "Resize photos to fit selected maximum pixel dimensions.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-resizer/",
    "keywords": "Resize photos to fit selected maximum pixel dimensions. image Resizing does not add original photographic detail. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "image-rotator",
    "name": "Rotate & Flip Image",
    "description": "Rotate 90°, 180° or 270°, or flip a picture.",
    "category": "image",
    "kind": "tool",
    "url": "/tools/image-rotator/",
    "keywords": "Rotate 90°, 180° or 270°, or flip a picture. image The output is encoded as PNG; EXIF may not be retained. zrain-image-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-editor",
    "name": "Add Text to PDF",
    "description": "Add new text to PDF pages; existing embedded text is not rewritten.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-editor/",
    "keywords": "Add new text to PDF pages; existing embedded text is not rewritten. pdf Adds new content; cannot directly rewrite existing PDF text. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "crop-pdf",
    "name": "Crop PDF",
    "description": "Trim visible page margins in millimetres using the PDF crop box.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/crop-pdf/",
    "keywords": "Trim visible page margins in millimetres using the PDF crop box. pdf Cropping hides content, it is NOT secure redaction. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "jpg-to-pdf",
    "name": "JPG & PNG to PDF",
    "description": "Create a PDF from up to 30 JPG or PNG pictures.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/jpg-to-pdf/",
    "keywords": "Create a PDF from up to 30 JPG or PNG pictures. pdf Image pages are not editable text. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "merge-pdf",
    "name": "Merge PDF",
    "description": "Combine two or more PDF files without rasterizing their pages.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/merge-pdf/",
    "keywords": "Combine two or more PDF files without rasterizing their pages. pdf Encrypted PDFs must be unlocked with permission first. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-page-numbers",
    "name": "PDF Page Numbers",
    "description": "Add page numbers to a PDF, optionally skipping its cover page.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-page-numbers/",
    "keywords": "Add page numbers to a PDF, optionally skipping its cover page. pdf Labels are a visible overlay, not a change to page order. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-to-image",
    "name": "PDF to Images",
    "description": "Render PDF pages as images.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-to-image/",
    "keywords": "Render PDF pages as images. pdf High-resolution rendering can use substantial memory. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-to-text",
    "name": "PDF to Text",
    "description": "Extract selectable text from PDF pages to a TXT file.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-to-text/",
    "keywords": "Extract selectable text from PDF pages to a TXT file. pdf Scanned PDFs without a text layer require OCR. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-watermark",
    "name": "PDF Watermark",
    "description": "Stamp text on every PDF page.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-watermark/",
    "keywords": "Stamp text on every PDF page. pdf Watermark is added as PDF content. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "pdf-organizer",
    "name": "Rearrange PDF Pages",
    "description": "Reorder, rotate and remove PDF pages.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/pdf-organizer/",
    "keywords": "Reorder, rotate and remove PDF pages. pdf Page-level editing with export. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "remove-pdf-pages",
    "name": "Remove PDF Pages",
    "description": "Remove selected pages, keeping the rest in order.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/remove-pdf-pages/",
    "keywords": "Remove selected pages, keeping the rest in order. pdf At least one page must remain. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "rotate-pdf",
    "name": "Rotate PDF",
    "description": "Rotate chosen PDF pages without re-rendering.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/rotate-pdf/",
    "keywords": "Rotate chosen PDF pages without re-rendering. pdf Only 90°, 180° and 270° supported. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "split-pdf",
    "name": "Split PDF",
    "description": "Split selected PDF pages into individual PDFs inside a ZIP.",
    "category": "pdf",
    "kind": "tool",
    "url": "/tools/split-pdf/",
    "keywords": "Split selected PDF pages into individual PDFs inside a ZIP. pdf Each page is copied without re-rendering, up to 200 pages. zrain-pdf-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "csv-cleaner",
    "name": "CSV Cleaner",
    "description": "Trim fields and remove duplicate spreadsheet rows.",
    "category": "document",
    "kind": "tool",
    "url": "/tools/csv-cleaner/",
    "keywords": "Trim fields and remove duplicate spreadsheet rows. file Download cleaned CSV; review results before replacing the original. zrain-document-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "file-converter",
    "name": "File Converter",
    "description": "Convert PDF, Word and images with clear visual-versus-editable options.",
    "category": "document",
    "kind": "tool",
    "url": "/tools/file-converter/",
    "keywords": "Convert PDF, Word and images with clear visual-versus-editable options. file Some conversions preserve text but not complex layouts. zrain-document-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "base64-tool",
    "name": "Base64 Converter",
    "description": "Encode and decode real UTF-8 text using standard or URL-safe Base64.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/base64-tool/",
    "keywords": "Encode and decode real UTF-8 text using standard or URL-safe Base64. text Base64 is encoding, not encryption. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "css-shadow-generator",
    "name": "CSS Shadow Generator",
    "description": "Preview a CSS box-shadow and copy its declaration.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/css-shadow-generator/",
    "keywords": "Preview a CSS box-shadow and copy its declaration. text Rendered appearance depends on the target browser and layout. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "json-studio",
    "name": "JSON Formatter & Validator",
    "description": "Validate, prettify or minify JSON.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/json-studio/",
    "keywords": "Validate, prettify or minify JSON. text Shows syntax errors without uploading data. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "jwt-decoder",
    "name": "JWT Decoder",
    "description": "Inspect JWT header and payload without sending tokens to a server.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/jwt-decoder/",
    "keywords": "Inspect JWT header and payload without sending tokens to a server. text Decoding does not verify the JWT signature. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "markdown-editor",
    "name": "Markdown Editor",
    "description": "Write README files and notes with a live Markdown preview.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/markdown-editor/",
    "keywords": "Write README files and notes with a live Markdown preview. text Supports basic headings, lists, bold, emphasis and code. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "password-generator",
    "name": "Password Generator",
    "description": "Generate strong random passwords on-device.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/password-generator/",
    "keywords": "Generate strong random passwords on-device. text Uses browser cryptographic randomness. Avoid saving sensitive passwords in plain text. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "qr-generator",
    "name": "QR Generator",
    "description": "Create locally generated QR images for URLs and text.",
    "category": "links",
    "kind": "tool",
    "url": "/tools/qr-generator/",
    "keywords": "Create locally generated QR images for URLs and text. creative QR codes are generated in your browser. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "hash-generator",
    "name": "SHA Hash Generator",
    "description": "Calculate SHA-256, SHA-384 or SHA-512 on local text.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/hash-generator/",
    "keywords": "Calculate SHA-256, SHA-384 or SHA-512 on local text. text Hashing is not encryption and is not a password-storage system. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "text-counter",
    "name": "Text Counter",
    "description": "Count words, characters, lines, sentences and reading time.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/text-counter/",
    "keywords": "Count words, characters, lines, sentences and reading time. text Reading time is approximate. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "utm-builder",
    "name": "UTM Builder",
    "description": "Create analytics-ready UTM campaign links without redirects.",
    "category": "links",
    "kind": "tool",
    "url": "/tools/utm-builder/",
    "keywords": "Create analytics-ready UTM campaign links without redirects. text Appends UTM parameters without shortening or redirecting the destination. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "uuid-generator",
    "name": "UUID Generator",
    "description": "Generate cryptographically random UUID v4 or sortable v7 IDs.",
    "category": "developer",
    "kind": "tool",
    "url": "/tools/uuid-generator/",
    "keywords": "Generate cryptographically random UUID v4 or sortable v7 IDs. text UUID v7 contains a creation timestamp. zrain-developer-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "invoice-generator",
    "name": "Invoice Generator",
    "description": "Create and export a simple itemized PDF invoice.",
    "category": "productivity",
    "kind": "tool",
    "url": "/tools/invoice-generator/",
    "keywords": "Create and export a simple itemized PDF invoice. file Best for simple invoices; verify all figures before sending. zrain-productivity-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "teleprompter",
    "name": "Teleprompter",
    "description": "Scroll a speech script at an adjustable speed with a mirror option.",
    "category": "productivity",
    "kind": "tool",
    "url": "/tools/teleprompter/",
    "keywords": "Scroll a speech script at an adjustable speed with a mirror option. text Browser-first teleprompter; remote control, recording and voice-follow are not implemented yet. zrain-productivity-tools",
    "engine": "v2.4.0"
  },
  {
    "id": "text-tools",
    "name": "Text Tools",
    "description": "Clean, transform and organize text.",
    "category": "productivity",
    "kind": "tool",
    "url": "/tools/text-tools/",
    "keywords": "Clean, transform and organize text. text Works with text pasted into your browser. zrain-productivity-tools",
    "engine": "v2.4.0"
  }
]);
export const INVENTORY = Object.freeze(SOURCE.map(entry=>Object.freeze({...entry})));
export const CATEGORIES = Object.freeze(TAXONOMY.map(c=>Object.freeze({
 id:c.id,title:c.name,blurb:c.description,icon:({games:'◉',ai:'✧',infrastructure:'⌘',links:'↗',monitoring:'◷',pdf:'▤',image:'✿',document:'☷',art:'◇',developer:'{ }',productivity:'☼'})[c.id],
 count:c.items.length
})));
if(!validateTaxonomy()||INVENTORY.length!==56||INVENTORY.filter(x=>x.kind==='tool').length!==46||
 new Set(INVENTORY.map(x=>x.id)).size!==56)throw Error('Expected 56 unique items with 46 approved v2.4 Tools');
for(const category of TAXONOMY){
 const expected=category.items.map(slugify).sort();
 const actual=INVENTORY.filter(x=>x.category===category.id).map(x=>slugify(x.name)).sort();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Category inventory mismatch: '+category.id);
}
