/**
 * Fail / File: public/ecosystem-inventory.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Satukan inventori utama dengan 58 nama rasmi daripada halaman Categories.
 * EN: Unify the homepage inventory with the 58 authoritative Categories names.
 */
import { CATEGORIES as TAXONOMY, slugify, validateTaxonomy } from './categories/category-data.mjs';

// BM: Kekalkan 48 laluan tools asal; pengesahan URL project dibuat berasingan.
// EN: Preserve all 48 original tool routes; independently verify project links.
const BASE_INVENTORY = Object.freeze([
  {
    "id": "guess-the-flag",
    "name": "Guess The Flag",
    "repoUrl": "https://github.com/zrain03/guess-the-flag",
    "description": "Learn countries and flags with 190 flags and practice modes.",
    "category": "play",
    "kind": "project",
    "url": "https://guesstheflag-zrain.web.app/",
    "keywords": "flag geography quiz game bendera tebak negara"
  },
  {
    "id": "memory-rush",
    "name": "Memory Rush",
    "repoUrl": "https://github.com/zrain03/memory-rush",
    "description": "Grid, Number and Pattern Recall memory games.",
    "category": "play",
    "kind": "project",
    "url": "https://memoryrush-zrain.web.app/",
    "keywords": "games recall grid number pattern memorise mengingat game"
  },
  {
    "id": "zrain-auth-starter",
    "name": "Zrain Auth Starter",
    "repoUrl": "https://github.com/zrain03/zrain-auth-starter",
    "description": "Java Spring Boot JWT authentication developer demo and template.",
    "category": "build",
    "kind": "project",
    "url": "https://zrain03.github.io/zrain-auth-starter/",
    "keywords": "jwt auth login java spring security api backend"
  },
  {
    "id": "zrain-ui",
    "name": "Zrain UI",
    "repoUrl": "https://github.com/zrain03/zrain-ui",
    "description": "Shared design system and component showcase.",
    "category": "build",
    "kind": "project",
    "url": "https://zrain.web.app/zrain-ui-showcase.html",
    "keywords": "design components brand user interface ui css"
  },
  {
    "id": "zrain-console",
    "name": "Zrain Console",
    "repoUrl": "https://github.com/zrain03/zrain-console",
    "description": "Open Zrain applications in a unified workspace.",
    "category": "build",
    "kind": "project",
    "url": "https://zrain.web.app/zrain-console.html",
    "keywords": "preview explore apps web application console"
  },
  {
    "id": "zrain-links",
    "name": "Zrain Links",
    "repoUrl": "https://github.com/zrain03/zrain-links",
    "description": "Create short links, QR previews and visits links.",
    "category": "everyday",
    "kind": "project",
    "url": "https://zrain-links.web.app/",
    "keywords": "shorten url link pendek pautan visits qr"
  },
  {
    "id": "zrain-monitor",
    "name": "Zrain Monitor",
    "repoUrl": "https://github.com/zrain03/zrain-monitor",
    "description": "Monitor uptime and public HTTPS services.",
    "category": "everyday",
    "kind": "project",
    "url": "https://zrain-monitor.web.app/",
    "keywords": "uptime monitor server website status api keep awake ping"
  },
  {
    "id": "image-converter",
    "name": "Image Converter",
    "description": "Convert JPG, PNG and WebP images.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-converter/",
    "keywords": "image Convert locally; format support depends on your browser. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "file-converter",
    "name": "File Converter",
    "description": "Convert PDF, Word and images with clear visual-versus-editable options.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/file-converter/",
    "keywords": "file Some conversions preserve text but not complex layouts. Document Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-enhancer",
    "name": "Image Enhancer",
    "description": "Upscale toward HD, Full HD or 4K dimensions and improve visible edges.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-enhancer/",
    "keywords": "image Enhancement cannot restore details absent from the original image. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-editor",
    "name": "PDF Editor",
    "description": "Add text to PDF pages.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-editor/",
    "keywords": "pdf Adds new content; cannot directly rewrite existing PDF text. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "color-inspector",
    "name": "Color Inspector",
    "description": "Pick colors from images or color swatches.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/color-inspector/",
    "keywords": "image HEX, RGB, HSL, CMYK and contrast. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "compare",
    "name": "Compare",
    "description": "Spot changes in two texts or documents.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/compare/",
    "keywords": "text Shows differences and cautious summaries; not an error detector. Document Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "emoji-art",
    "name": "Emoji Art",
    "description": "Recreate a photo as an emoji mosaic.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/emoji-art/",
    "keywords": "creative An artistic interpretation rather than an exact reconstruction. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "background-remover",
    "name": "Background Remover",
    "description": "Remove flat-color photo backgrounds.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/background-remover/",
    "keywords": "image Works best on solid backgrounds, not complex scenery. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "collage-maker",
    "name": "Collage Maker",
    "description": "Arrange your images into a collage.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/collage-maker/",
    "keywords": "creative Export one combined PNG. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-inspector",
    "name": "Image Inspector",
    "description": "Inspect embedded EXIF, file signatures, SHA-256 and image properties.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-inspector/",
    "keywords": "image File information stays on your device. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pixel-art",
    "name": "Pixel Art",
    "description": "Transform photos into pixel-style artwork.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/pixel-art/",
    "keywords": "creative Control pixel size and color depth. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-organizer",
    "name": "PDF Organizer",
    "description": "Merge, reorder, rotate or remove pages.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-organizer/",
    "keywords": "pdf Page-level editing with export. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-compare",
    "name": "Image Compare",
    "description": "Compare two images and highlight changes.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-compare/",
    "keywords": "image Pixel differences are not necessarily mistakes. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "watermark",
    "name": "Watermark",
    "description": "Add text watermarks to images.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/watermark/",
    "keywords": "image Export watermarked images as PNG. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-cropper",
    "name": "Image Cropper",
    "description": "Crop an image to your preferred area.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-cropper/",
    "keywords": "image Choose exact coordinates and dimensions. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "icon-maker",
    "name": "Icon Maker",
    "description": "Generate eight standard PNG icon sizes in a single ZIP.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/icon-maker/",
    "keywords": "image Multiple standard sizes in one ZIP. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-watermark",
    "name": "PDF Watermark",
    "description": "Stamp text on every PDF page.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-watermark/",
    "keywords": "pdf Watermark is added as PDF content. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "text-extractor",
    "name": "Text Extractor",
    "description": "Read text from images with OCR.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/text-extractor/",
    "keywords": "text Recognition may be imperfect and initially needs internet access. Document Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-to-ascii",
    "name": "Image to ASCII",
    "description": "Turn an image into text-based artwork.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-to-ascii/",
    "keywords": "creative Export plain text art. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "json-studio",
    "name": "JSON Studio",
    "description": "Validate, prettify or minify JSON.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/json-studio/",
    "keywords": "text Shows syntax errors without uploading data. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "csv-cleaner",
    "name": "CSV Cleaner",
    "description": "Trim fields and remove duplicate spreadsheet rows.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/csv-cleaner/",
    "keywords": "file Download cleaned CSV; review results before replacing the original. Document Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "invoice-generator",
    "name": "Invoice Generator",
    "description": "Create and export a simple itemized PDF invoice.",
    "category": "everyday",
    "kind": "tool",
    "url": "/tools/invoice-generator/",
    "keywords": "file Best for simple invoices; verify all figures before sending. Productivity Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "markdown-editor",
    "name": "Markdown Editor",
    "description": "Write README files and notes with a live Markdown preview.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/markdown-editor/",
    "keywords": "text Supports basic headings, lists, bold, emphasis and code. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "qr-generator",
    "name": "QR Generator",
    "description": "Create locally generated QR images for URLs and text.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/qr-generator/",
    "keywords": "creative QR codes are generated in your browser. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "text-tools",
    "name": "Text Tools",
    "description": "Clean, transform and organize text.",
    "category": "everyday",
    "kind": "tool",
    "url": "/tools/text-tools/",
    "keywords": "text Works with text pasted into your browser. Productivity Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "focus-timer",
    "name": "Focus Timer",
    "description": "Run a persistent focus and break timer with pause and resume.",
    "category": "everyday",
    "kind": "tool",
    "url": "/tools/focus-timer/",
    "keywords": "creative Your completed sessions count stays on this device. Productivity Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "password-generator",
    "name": "Password Generator",
    "description": "Generate strong random passwords on-device.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/password-generator/",
    "keywords": "text Uses browser cryptographic randomness. Avoid saving sensitive passwords in plain text. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "utm-builder",
    "name": "UTM Builder",
    "description": "Create analytics-ready UTM campaign links without redirects.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/utm-builder/",
    "keywords": "text Appends UTM parameters without shortening or redirecting the destination. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "base64-tool",
    "name": "Base64 Converter",
    "description": "Encode and decode real UTF-8 text using standard or URL-safe Base64.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/base64-tool/",
    "keywords": "text Base64 is encoding, not encryption. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "jwt-decoder",
    "name": "JWT Decoder",
    "description": "Inspect JWT header and payload without sending tokens to a server.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/jwt-decoder/",
    "keywords": "text Decoding does not verify the JWT signature. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "word-counter",
    "name": "Word Counter",
    "description": "Count words, characters, lines, sentences and reading time.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/word-counter/",
    "keywords": "text Reading time is approximate. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "hash-generator",
    "name": "SHA Hash Generator",
    "description": "Calculate SHA-256, SHA-384 or SHA-512 on local text.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/hash-generator/",
    "keywords": "text Hashing is not encryption and is not a password-storage system. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "uuid-generator",
    "name": "UUID Generator",
    "description": "Generate cryptographically random UUID v4 or sortable v7 IDs.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/uuid-generator/",
    "keywords": "text UUID v7 contains a creation timestamp. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "css-shadow-generator",
    "name": "CSS Shadow Generator",
    "description": "Preview a CSS box-shadow and copy its declaration.",
    "category": "build",
    "kind": "tool",
    "url": "/tools/css-shadow-generator/",
    "keywords": "text Rendered appearance depends on the target browser and layout. Developer Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-resizer",
    "name": "Resize Image",
    "description": "Resize photos to fit selected maximum pixel dimensions.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-resizer/",
    "keywords": "image Resizing does not add original photographic detail. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-rotator",
    "name": "Rotate & Flip Image",
    "description": "Rotate 90°, 180° or 270°, or flip a picture.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-rotator/",
    "keywords": "image The output is encoded as PNG; EXIF may not be retained. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "image-compressor",
    "name": "Compress Image",
    "description": "Re-encode an image with adjustable JPEG, WebP or PNG quality.",
    "category": "design",
    "kind": "tool",
    "url": "/tools/image-compressor/",
    "keywords": "image Lossless PNG can be larger; output may not always shrink. Image Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "merge-pdf",
    "name": "Merge PDF",
    "description": "Combine two or more PDF files without rasterizing their pages.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/merge-pdf/",
    "keywords": "pdf Encrypted PDFs must be unlocked with permission first. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "split-pdf",
    "name": "Split PDF",
    "description": "Split selected PDF pages into individual PDFs inside a ZIP.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/split-pdf/",
    "keywords": "pdf Each page is copied without re-rendering, up to 200 pages. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "rotate-pdf",
    "name": "Rotate PDF",
    "description": "Rotate chosen PDF pages without re-rendering.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/rotate-pdf/",
    "keywords": "pdf Only 90°, 180° and 270° supported. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "crop-pdf",
    "name": "Crop PDF",
    "description": "Trim visible page margins in millimetres using the PDF crop box.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/crop-pdf/",
    "keywords": "pdf Cropping hides content, it is NOT secure redaction. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "remove-pdf-pages",
    "name": "Remove PDF Pages",
    "description": "Remove selected pages, keeping the rest in order.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/remove-pdf-pages/",
    "keywords": "pdf At least one page must remain. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "extract-pdf-pages",
    "name": "Extract PDF Pages",
    "description": "Copy chosen PDF pages into a new PDF in the order selected.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/extract-pdf-pages/",
    "keywords": "pdf A page repeated in the selection is included once. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-to-text",
    "name": "PDF to Text",
    "description": "Extract selectable text from PDF pages to a TXT file.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-to-text/",
    "keywords": "pdf Scanned PDFs without a text layer require OCR. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-to-image",
    "name": "PDF to Images",
    "description": "Render PDF pages to JPG or PNG and download them as ZIP.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-to-image/",
    "keywords": "pdf High-resolution rendering can use substantial memory. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "jpg-to-pdf",
    "name": "JPG & PNG to PDF",
    "description": "Create a PDF from up to 30 JPG or PNG pictures.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/jpg-to-pdf/",
    "keywords": "pdf Image pages are not editable text. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "pdf-page-numbers",
    "name": "PDF Page Numbers",
    "description": "Add page numbers to a PDF, optionally skipping its cover page.",
    "category": "documents",
    "kind": "tool",
    "url": "/tools/pdf-page-numbers/",
    "keywords": "pdf Labels are a visible overlay, not a change to page order. PDF Tools",
    "engine": "v2-alpha"
  },
  {
    "id": "teleprompter",
    "name": "Teleprompter",
    "description": "Scroll a speech script at an adjustable speed with a mirror option.",
    "category": "everyday",
    "kind": "tool",
    "url": "/tools/teleprompter/",
    "keywords": "text Browser-first teleprompter; remote control, recording and voice-follow are not implemented yet. Productivity Tools",
    "engine": "v2-alpha"
  }
]);
// BM: Tambah hanya projek yang benar-benar ada dalam senarai rasmi 58 item.
// EN: Add only projects expressly present in the existing 58-item taxonomy.
const ADDITIONAL_PROJECTS = Object.freeze([
  {id:'zrain-ai',name:'Zrain AI',description:'Public multilingual assistant using Cloudflare AI.',category:'ai',kind:'project',url:'https://zrain-ai.web.app/',repoUrl:'https://github.com/zrain03/zrain-ai',keywords:'chat assistant multilingual ai chatbot'},
  {id:'zrain-community',name:'Zrain Community',description:'Product-specific public feedback and moderation integration.',category:'infrastructure',kind:'project',url:'https://github.com/zrain03/zrain-community',repoUrl:'https://github.com/zrain03/zrain-community',keywords:'feedback community moderation API github'},
  {id:'zrain-gifts',name:'Zrain Gifts',description:'Developer portfolio and digital gifting platform, with payment features subject to release status.',category:'links',kind:'project',url:'https://zrain-gifts.zrain-dev.workers.dev/',keywords:'developer portfolio tips gifts digital presence'}
]);
// BM: Ketepatan pembahagian ditentukan oleh nama, bukan bilangan atau kod lama.
// EN: Assign categories by official names, not obsolete numeric counts or aliases.
validateTaxonomy();
const nameToCategory = new Map(TAXONOMY.flatMap(c => c.items.map(name => [slugify(name), c.id])));
export const INVENTORY = Object.freeze([...BASE_INVENTORY, ...ADDITIONAL_PROJECTS].map(item => {
  const category = nameToCategory.get(slugify(item.name));
  if (!category) throw new Error('Missing taxonomy category: '+item.name);
  return Object.freeze({...item,category});
}));
if (INVENTORY.length!==58 || new Set(INVENTORY.map(x=>x.id)).size!==58 ||
    new Set(INVENTORY.map(x=>slugify(x.name))).size!==58) {
  throw new Error('Homepage inventory must contain exactly 58 distinct entries');
}
const CATEGORY_ICONS = Object.freeze({games:'◉',ai:'✧',infrastructure:'⌘',links:'↗',monitoring:'◷',pdf:'▤',image:'✿',document:'☷',art:'◇',developer:'{ }',productivity:'☼'});
export const CATEGORIES = Object.freeze(TAXONOMY.map(category => Object.freeze({
  id:category.id,title:category.name,blurb:category.description,
  icon:CATEGORY_ICONS[category.id],count:category.items.length
})));
