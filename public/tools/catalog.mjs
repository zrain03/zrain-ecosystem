/*
 * Fail / File: tool-runtime/src/catalog.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengisytiharkan semua keluarga dan item Tools dengan slug unik dan metadata penggunaan.
 * EN: Declares every Tools family and item with unique slugs and usage metadata.
 */
export const catalog = [
  ['image-converter','Image Converter','Convert JPG, PNG and WebP images.','image','Convert locally; format support depends on your browser.'],
  ['file-converter','File Converter','Convert PDF, Word and images with clear visual-versus-editable options.','file','Some conversions preserve text but not complex layouts.'],
  ['image-enhancer','Image Enhancer','Upscale toward HD, Full HD or 4K dimensions and improve visible edges.','image','Enhancement cannot restore details absent from the original image.'],
  ['pdf-editor','PDF Editor','Add text to PDF pages.','pdf','Adds new content; cannot directly rewrite existing PDF text.'],
  ['color-inspector','Color Inspector','Pick colors from images or color swatches.','image','HEX, RGB, HSL, CMYK and contrast.'],
  ['compare','Compare','Spot changes in two texts or documents.','text','Shows differences and cautious summaries; not an error detector.'],
  ['emoji-art','Emoji Art','Recreate a photo as an emoji mosaic.','creative','An artistic interpretation rather than an exact reconstruction.'],
  ['background-remover','Background Remover','Remove flat-color photo backgrounds.','image','Works best on solid backgrounds, not complex scenery.'],
  ['collage-maker','Collage Maker','Arrange your images into a collage.','creative','Export one combined PNG.'],
  ['image-inspector','Image Inspector','Inspect embedded EXIF, file signatures, SHA-256 and image properties.','image','File information stays on your device.'],
  ['pixel-art','Pixel Art','Transform photos into pixel-style artwork.','creative','Control pixel size and color depth.'],
  ['pdf-organizer','PDF Organizer','Merge, reorder, rotate or remove pages.','pdf','Page-level editing with export.'],
  ['image-compare','Image Compare','Compare two images and highlight changes.','image','Pixel differences are not necessarily mistakes.'],
  ['watermark','Watermark','Add text watermarks to images.','image','Export watermarked images as PNG.'],
  ['image-cropper','Image Cropper','Crop an image to your preferred area.','image','Choose exact coordinates and dimensions.'],
  ['icon-maker','Icon Maker','Generate eight standard PNG icon sizes in a single ZIP.','image','Multiple standard sizes in one ZIP.'],
  ['pdf-watermark','PDF Watermark','Stamp text on every PDF page.','pdf','Watermark is added as PDF content.'],
  ['text-extractor','Text Extractor','Read text from images with OCR.','text','Recognition may be imperfect and initially needs internet access.'],
  ['image-to-ascii','Image to ASCII','Turn an image into text-based artwork.','creative','Export plain text art.'],
  ['json-studio','JSON Studio','Validate, prettify or minify JSON.','text','Shows syntax errors without uploading data.'],
  ['csv-cleaner','CSV Cleaner','Trim fields and remove duplicate spreadsheet rows.','file','Download cleaned CSV; review results before replacing the original.'],
  ['invoice-generator','Invoice Generator','Create and export a simple itemized PDF invoice.','file','Best for simple invoices; verify all figures before sending.'],
  ['markdown-editor','Markdown Editor','Write README files and notes with a live Markdown preview.','text','Supports basic headings, lists, bold, emphasis and code.'],
  ['qr-generator','QR Generator','Create locally generated QR images for URLs and text.','creative','QR codes are generated in your browser.'],
  ['text-tools','Text Tools','Clean, transform and organize text.','text','Works with text pasted into your browser.'],
  ['focus-timer','Focus Timer','Run a persistent focus and break timer with pause and resume.','creative','Your completed sessions count stays on this device.'],
  ['password-generator','Password Generator','Generate strong random passwords on-device.','text','Uses browser cryptographic randomness. Avoid saving sensitive passwords in plain text.'],
  ['utm-builder','UTM Builder','Create analytics-ready UTM campaign links without redirects.','text','Appends UTM parameters without shortening or redirecting the destination.'],

  ['base64-tool','Base64 Converter','Encode and decode real UTF-8 text using standard or URL-safe Base64.','text','Base64 is encoding, not encryption.'],
  ['jwt-decoder','JWT Decoder','Inspect JWT header and payload without sending tokens to a server.','text','Decoding does not verify the JWT signature.'],
  ['word-counter','Word Counter','Count words, characters, lines, sentences and reading time.','text','Reading time is approximate.'],
  ['hash-generator','SHA Hash Generator','Calculate SHA-256, SHA-384 or SHA-512 on local text.','text','Hashing is not encryption and is not a password-storage system.'],
  ['uuid-generator','UUID Generator','Generate cryptographically random UUID v4 or sortable v7 IDs.','text','UUID v7 contains a creation timestamp.'],
  ['css-shadow-generator','CSS Shadow Generator','Preview a CSS box-shadow and copy its declaration.','text','Rendered appearance depends on the target browser and layout.'],
  ['image-resizer','Resize Image','Resize photos to fit selected maximum pixel dimensions.','image','Resizing does not add original photographic detail.'],
  ['image-rotator','Rotate & Flip Image','Rotate 90°, 180° or 270°, or flip a picture.','image','The output is encoded as PNG; EXIF may not be retained.'],
  ['image-compressor','Compress Image','Re-encode an image with adjustable JPEG, WebP or PNG quality.','image','Lossless PNG can be larger; output may not always shrink.'],
  ['merge-pdf','Merge PDF','Combine two or more PDF files without rasterizing their pages.','pdf','Encrypted PDFs must be unlocked with permission first.'],
  ['split-pdf','Split PDF','Split selected PDF pages into individual PDFs inside a ZIP.','pdf','Each page is copied without re-rendering, up to 200 pages.'],
  ['rotate-pdf','Rotate PDF','Rotate chosen PDF pages without re-rendering.','pdf','Only 90°, 180° and 270° supported.'],
  ['crop-pdf','Crop PDF','Trim visible page margins in millimetres using the PDF crop box.','pdf','Cropping hides content, it is NOT secure redaction.'],
  ['remove-pdf-pages','Remove PDF Pages','Remove selected pages, keeping the rest in order.','pdf','At least one page must remain.'],
  ['extract-pdf-pages','Extract PDF Pages','Copy chosen PDF pages into a new PDF in the order selected.','pdf','A page repeated in the selection is included once.'],
  ['pdf-to-text','PDF to Text','Extract selectable text from PDF pages to a TXT file.','pdf','Scanned PDFs without a text layer require OCR.'],
  ['pdf-to-image','PDF to Images','Render PDF pages to JPG or PNG and download them as ZIP.','pdf','High-resolution rendering can use substantial memory.'],
  ['jpg-to-pdf','JPG & PNG to PDF','Create a PDF from up to 30 JPG or PNG pictures.','pdf','Image pages are not editable text.'],
  ['pdf-page-numbers','PDF Page Numbers','Add page numbers to a PDF, optionally skipping its cover page.','pdf','Labels are a visible overlay, not a change to page order.'],
  ['teleprompter','Teleprompter','Scroll a speech script at an adjustable speed with a mirror option.','text','Browser-first teleprompter; remote control, recording and voice-follow are not implemented yet.'],
];


// Each family is a single standalone Zrain product, with many tools within it.
// These five entries, not the individual utilities, belong in Zrain Ecosystem.
export const groups = [
  {
    slug:'zrain-image-tools',title:'Image Tools',kind:'Images',symbol:'◈',
    headline:'Everything for your images.',
    description:'Convert, inspect, edit and create with images: all in one easy workspace.',
    sections:[
      {title:'Convert & inspect',description:'Know your image and get the format you need.',tools:['image-converter','image-inspector','color-inspector','image-compare','image-compressor']},
      {title:'Edit & improve',description:'Make practical changes without uploading your images to Zrain.',tools:['image-enhancer','background-remover','image-cropper','watermark','image-resizer','image-rotator']},
      {title:'Create & transform',description:'Experiment with new styles and prepare shareable assets.',tools:['collage-maker','pixel-art','emoji-art','icon-maker','image-to-ascii']}
    ]
  },
  {
    slug:'zrain-pdf-tools',title:'PDF Tools',kind:'PDF',symbol:'▤',
    headline:'Make PDFs easier to manage.',
    description:'Add content, reorganize pages and add watermarks to PDF documents.',
    sections:[
      {title:'Edit & mark',description:'Add new content to existing pages.',tools:['pdf-editor','pdf-watermark','pdf-page-numbers']},
      {title:'Arrange pages',description:'Reorder, merge, rotate and remove PDF pages.',tools:['pdf-organizer','merge-pdf','split-pdf','rotate-pdf','crop-pdf','remove-pdf-pages','extract-pdf-pages']},
      {title:'Convert PDF',description:'Create PDF files and extract pages as images or text.',tools:['jpg-to-pdf','pdf-to-text','pdf-to-image']}
    ]
  },
  {
    slug:'zrain-document-tools',title:'Document Tools',kind:'Documents',symbol:'≡',
    headline:'Work smarter with documents.',
    description:'Convert, compare, extract and clean documents without an account.',
    sections:[
      {title:'Convert & extract',description:'Get your text into a format you can work with.',tools:['file-converter','text-extractor']},
      {title:'Review & clean',description:'Find differences and tidy structured data.',tools:['compare','csv-cleaner']}
    ]
  },
  {
    slug:'zrain-developer-tools',title:'Developer Tools',kind:'Development',symbol:'{ }',
    headline:'Useful helpers for everyday building.',
    description:'Small practical tools for code, content, links and security.',
    sections:[
      {title:'Write & validate',description:'Inspect JSON and prepare readable documentation.',tools:['json-studio','markdown-editor','base64-tool','jwt-decoder','word-counter','hash-generator','uuid-generator','css-shadow-generator']},
      {title:'Generate & share',description:'Create secure random passwords, QR images and tracking URLs.',tools:['password-generator','qr-generator','utm-builder']}
    ]
  },
  {
    slug:'zrain-productivity-tools',title:'Productivity Tools',kind:'Everyday',symbol:'✦',
    headline:'Little helpers for your day.',
    description:'Prepare simple invoices, organize text and manage focus sessions.',
    sections:[
      {title:'Documents & text',description:'Prepare invoices and clean up everyday text.',tools:['invoice-generator','text-tools','teleprompter']},
      {title:'Focus',description:'Keep track of work and rest sessions.',tools:['focus-timer']}
    ]
  }
];
// BM: findGroup: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: mengisytiharkan semua keluarga dan item Tools dengan slug unik dan metadata penggunaan.
// EN: findGroup: Reads relevant records and returns a bounded result to the caller. Module purpose: declares every Tools family and item with unique slugs and usage metadata.
export const findGroup = toolSlug => groups.find(group => group.sections.some(section => section.tools.includes(toolSlug)));
