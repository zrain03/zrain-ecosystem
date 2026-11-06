/*
 * Fail / File: tool-runtime/src/catalog.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
// Zrain Tools v2: approved 46-tool mobile-first catalogue.
export const catalog = [
  [
    "watermark",
    "Add Image Watermark",
    "Add text watermarks to images.",
    "image",
    "Export watermarked images as PNG."
  ],
  [
    "background-remover",
    "Background Remover",
    "Remove the image background with private, on-device AI.",
    "image",
    "The AI model downloads on first use; review fine details and transparent edges."
  ],
  [
    "collage-maker",
    "Collage Maker",
    "Arrange your images into a collage.",
    "creative",
    "Export one combined PNG."
  ],
  [
    "color-inspector",
    "Color Picker & Inspector",
    "Pick a color from an image and inspect HEX, RGB and contrast.",
    "image",
    "HEX, RGB, HSL, CMYK and contrast."
  ],
  [
    "image-compare",
    "Compare Images",
    "Compare two images to see visual differences.",
    "image",
    "Pixel differences are not necessarily mistakes."
  ],
  [
    "image-compressor",
    "Compress Image",
    "Make a smaller image file and review the result before download.",
    "image",
    "Only offers a download when the encoded result is smaller."
  ],
  [
    "text-extractor",
    "Extract Text from Image",
    "Read text from images using OCR.",
    "text",
    "Recognition may be imperfect and initially needs internet access."
  ],
  [
    "image-converter",
    "Image Converter",
    "Convert JPG, PNG and WebP images.",
    "image",
    "Convert locally; format support depends on your browser."
  ],
  [
    "image-cropper",
    "Image Cropper",
    "Crop an image and preview the result.",
    "image",
    "Drag the crop box or enter exact pixel coordinates."
  ],
  [
    "image-enhancer",
    "Image Enhancer",
    "Upscale toward HD, Full HD or 4K dimensions and improve visible edges.",
    "image",
    "Enhancement cannot restore details absent from the original image."
  ],
  [
    "image-inspector",
    "Image Metadata Viewer",
    "View embedded image properties and technical metadata.",
    "image",
    "File information stays on your device."
  ],
  [
    "image-to-ascii-art",
    "Image to ASCII Art",
    "Create text-character art from an image.",
    "creative",
    "Preview character art and export PNG, PDF or TXT."
  ],
  [
    "image-to-binary-art",
    "Image to Binary Art",
    "Create a 0-and-1 artwork from an image.",
    "creative",
    "Export PNG and PDF, with optional TXT."
  ],
  [
    "image-to-block-art",
    "Image to Block Art",
    "Create shaded character-block artwork from an image.",
    "creative",
    "Export PNG and PDF, with optional TXT."
  ],
  [
    "emoji-art",
    "Image to Emoji Art",
    "Transform an uploaded image into artwork using emojis you choose.",
    "creative",
    "Choose your own emoji set; export PNG or PDF."
  ],
  [
    "pixel-art",
    "Image to Pixel Art",
    "Turn an image into pixel-style artwork.",
    "creative",
    "Preview pixel art and export PNG or PDF."
  ],
  [
    "image-resizer",
    "Resize Image",
    "Resize photos to fit selected maximum pixel dimensions.",
    "image",
    "Resizing does not add original photographic detail."
  ],
  [
    "image-rotator",
    "Rotate & Flip Image",
    "Rotate 90°, 180° or 270°, or flip a picture.",
    "image",
    "The output is encoded as PNG; EXIF may not be retained."
  ],
  [
    "pdf-editor",
    "Add Text to PDF",
    "Add new text to PDF pages; existing embedded text is not rewritten.",
    "pdf",
    "Adds new content; cannot directly rewrite existing PDF text."
  ],
  [
    "crop-pdf",
    "Crop PDF",
    "Trim visible page margins in millimetres using the PDF crop box.",
    "pdf",
    "Cropping hides content, it is NOT secure redaction."
  ],
  [
    "jpg-to-pdf",
    "JPG & PNG to PDF",
    "Create a PDF from up to 30 JPG or PNG pictures.",
    "pdf",
    "Image pages are not editable text."
  ],
  [
    "merge-pdf",
    "Merge PDF",
    "Combine two or more PDF files without rasterizing their pages.",
    "pdf",
    "Encrypted PDFs must be unlocked with permission first."
  ],
  [
    "pdf-page-numbers",
    "PDF Page Numbers",
    "Add page numbers to a PDF, optionally skipping its cover page.",
    "pdf",
    "Labels are a visible overlay, not a change to page order."
  ],
  [
    "pdf-to-image",
    "PDF to Images",
    "Render PDF pages as images.",
    "pdf",
    "High-resolution rendering can use substantial memory."
  ],
  [
    "pdf-to-text",
    "PDF to Text",
    "Extract selectable text from PDF pages to a TXT file.",
    "pdf",
    "Scanned PDFs without a text layer require OCR."
  ],
  [
    "pdf-watermark",
    "PDF Watermark",
    "Stamp text on every PDF page.",
    "pdf",
    "Watermark is added as PDF content."
  ],
  [
    "pdf-organizer",
    "Rearrange PDF Pages",
    "Reorder, rotate and remove PDF pages.",
    "pdf",
    "Page-level editing with export."
  ],
  [
    "remove-pdf-pages",
    "Remove PDF Pages",
    "Remove selected pages, keeping the rest in order.",
    "pdf",
    "At least one page must remain."
  ],
  [
    "rotate-pdf",
    "Rotate PDF",
    "Rotate chosen PDF pages without re-rendering.",
    "pdf",
    "Only 90°, 180° and 270° supported."
  ],
  [
    "split-pdf",
    "Split PDF",
    "Split selected PDF pages into individual PDFs inside a ZIP.",
    "pdf",
    "Each page is copied without re-rendering, up to 200 pages."
  ],
  [
    "csv-cleaner",
    "CSV Cleaner",
    "Trim fields and remove duplicate spreadsheet rows.",
    "file",
    "Download cleaned CSV; review results before replacing the original."
  ],
  [
    "file-converter",
    "File Converter",
    "Convert PDF, Word and images with clear visual-versus-editable options.",
    "file",
    "Some conversions preserve text but not complex layouts."
  ],
  [
    "base64-tool",
    "Base64 Converter",
    "Encode and decode real UTF-8 text using standard or URL-safe Base64.",
    "text",
    "Base64 is encoding, not encryption."
  ],
  [
    "css-shadow-generator",
    "CSS Shadow Generator",
    "Preview a CSS box-shadow and copy its declaration.",
    "text",
    "Rendered appearance depends on the target browser and layout."
  ],
  [
    "json-studio",
    "JSON Formatter & Validator",
    "Validate, prettify or minify JSON.",
    "text",
    "Shows syntax errors without uploading data."
  ],
  [
    "jwt-decoder",
    "JWT Decoder",
    "Inspect JWT header and payload without sending tokens to a server.",
    "text",
    "Decoding does not verify the JWT signature."
  ],
  [
    "markdown-editor",
    "Markdown Editor",
    "Write README files and notes with a live Markdown preview.",
    "text",
    "Supports basic headings, lists, bold, emphasis and code."
  ],
  [
    "password-generator",
    "Password Generator",
    "Generate strong random passwords on-device.",
    "text",
    "Uses browser cryptographic randomness. Avoid saving sensitive passwords in plain text."
  ],
  [
    "qr-generator",
    "QR Generator",
    "Create locally generated QR images for URLs and text.",
    "creative",
    "QR codes are generated in your browser."
  ],
  [
    "hash-generator",
    "SHA Hash Generator",
    "Calculate SHA-256, SHA-384 or SHA-512 on local text.",
    "text",
    "Hashing is not encryption and is not a password-storage system."
  ],
  [
    "text-counter",
    "Text Counter",
    "Count words, characters, lines, sentences and reading time.",
    "text",
    "Reading time is approximate."
  ],
  [
    "utm-builder",
    "UTM Builder",
    "Create analytics-ready UTM campaign links without redirects.",
    "text",
    "Appends UTM parameters without shortening or redirecting the destination."
  ],
  [
    "uuid-generator",
    "UUID Generator",
    "Generate cryptographically random UUID v4 or sortable v7 IDs.",
    "text",
    "UUID v7 contains a creation timestamp."
  ],
  [
    "invoice-generator",
    "Invoice Generator",
    "Create and export a simple itemized PDF invoice.",
    "file",
    "Best for simple invoices; verify all figures before sending."
  ],
  [
    "teleprompter",
    "Teleprompter",
    "Scroll a speech script at an adjustable speed with a mirror option.",
    "text",
    "Browser-first teleprompter; remote control, recording and voice-follow are not implemented yet."
  ],
  [
    "text-tools",
    "Text Tools",
    "Clean, transform and organize text.",
    "text",
    "Works with text pasted into your browser."
  ]
];
export const groups = [
  {
    "slug": "zrain-image-tools",
    "title": "Image Tools",
    "kind": "Images",
    "symbol": "◈",
    "headline": "Image tools made simple.",
    "description": "Convert, edit and create images with clear previews.",
    "sections": [
      {
        "title": "All tools A–Z",
        "description": "Choose a tool to begin.",
        "tools": [
          "watermark",
          "background-remover",
          "collage-maker",
          "color-inspector",
          "image-compare",
          "image-compressor",
          "text-extractor",
          "image-converter",
          "image-cropper",
          "image-enhancer",
          "image-inspector",
          "image-to-ascii-art",
          "image-to-binary-art",
          "image-to-block-art",
          "emoji-art",
          "pixel-art",
          "image-resizer",
          "image-rotator"
        ]
      }
    ]
  },
  {
    "slug": "zrain-pdf-tools",
    "title": "PDF Tools",
    "kind": "PDF",
    "symbol": "▤",
    "headline": "PDF tasks, clearly organised.",
    "description": "Merge, split, arrange and convert PDF documents.",
    "sections": [
      {
        "title": "All tools A–Z",
        "description": "Choose a tool to begin.",
        "tools": [
          "pdf-editor",
          "crop-pdf",
          "jpg-to-pdf",
          "merge-pdf",
          "pdf-page-numbers",
          "pdf-to-image",
          "pdf-to-text",
          "pdf-watermark",
          "pdf-organizer",
          "remove-pdf-pages",
          "rotate-pdf",
          "split-pdf"
        ]
      }
    ]
  },
  {
    "slug": "zrain-document-tools",
    "title": "Document Tools",
    "kind": "Documents",
    "symbol": "≡",
    "headline": "Work with documents, easily.",
    "description": "Convert and clean files with clear output previews.",
    "sections": [
      {
        "title": "All tools A–Z",
        "description": "Choose a tool to begin.",
        "tools": [
          "csv-cleaner",
          "file-converter"
        ]
      }
    ]
  },
  {
    "slug": "zrain-developer-tools",
    "title": "Developer Tools",
    "kind": "Development",
    "symbol": "{ }",
    "headline": "Useful development tools.",
    "description": "Small helpers for code, URLs and content.",
    "sections": [
      {
        "title": "All tools A–Z",
        "description": "Choose a tool to begin.",
        "tools": [
          "base64-tool",
          "css-shadow-generator",
          "json-studio",
          "jwt-decoder",
          "markdown-editor",
          "password-generator",
          "qr-generator",
          "hash-generator",
          "text-counter",
          "utm-builder",
          "uuid-generator"
        ]
      }
    ]
  },
  {
    "slug": "zrain-productivity-tools",
    "title": "Productivity Tools",
    "kind": "Everyday",
    "symbol": "✦",
    "headline": "Simple everyday tools.",
    "description": "Invoices, text tools and speaking assistance.",
    "sections": [
      {
        "title": "All tools A–Z",
        "description": "Choose a tool to begin.",
        "tools": [
          "invoice-generator",
          "teleprompter",
          "text-tools"
        ]
      }
    ]
  }
];
export const findGroup = toolSlug => groups.find(group => group.sections.some(section => section.tools.includes(toolSlug)));
