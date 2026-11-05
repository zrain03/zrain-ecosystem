/*
 * Fail / File: tool-runtime/src/workflow-guide.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan panduan tiga langkah dan hasil yang dijangka bagi setiap tool awam.
 * EN: Provides three-step guidance and expected results for every public tool.
 */
/** Practical, non-technical instructions shown above every Zrain utility. */
export const workflows = {
 'base64-tool':{why:"Turn Unicode text into portable Base64 data or read Base64 back as normal text.",steps:["Paste text for encoding or paste an encoded Base64 string for decoding.","Choose Encode or Decode and optionally select the URL-safe alphabet.","Convert and copy the visible result into your application."],output:"A UTF-8 text string encoded or decoded entirely in the browser.",note:"Base64 does not hide secrets, encrypt text or authenticate messages."},
 'jwt-decoder':{why:"Understand the claims and timestamps inside a JWT you already possess.",steps:["Paste the three-segment JWT token into the provided textarea.","Choose Decode token to inspect header and payload JSON.","Read the clearly labelled unverified result; never assume the signature is valid."],output:"A formatted local header-and-payload JSON view.",note:"Decoding is NOT signature verification and is unsafe as an authorization check."},
 'word-counter':{why:"Check the length of an essay, article, statement or other text.",steps:["Paste or type your text into the editable input area.","Review the live counts of words, characters, paragraphs and sentences.","Copy statistics when they match your intended text."],output:"Visible statistics and a basic estimated reading time.",note:"Sentence boundaries and reading time are approximate for different languages."},
 'hash-generator':{why:"Create a checksum of a text string for comparing or checking changes.",steps:["Paste the text whose bytes should be hashed into the input box.","Choose the SHA-256, SHA-384 or SHA-512 algorithm.","Calculate and copy the resulting hexadecimal fingerprint."],output:"A cryptographic text checksum computed with Web Crypto.",note:"A hash is not encryption and this tool does not hash uploaded files."},
 'uuid-generator':{why:"Generate identifiers for tests, records and developer prototypes.",steps:["Choose random UUID v4 or time-sortable UUID v7.","Select the number of IDs to generate, up to 500 per batch.","Generate and copy the lines into your project or test data."],output:"Securely generated UUID strings, one per line.",note:"UUIDs are not passwords and v7 embeds the creation timestamp."},
 'css-shadow-generator':{why:"Design CSS box shadows by previewing the effect before copying code.",steps:["Choose the horizontal and vertical offsets along with blur and spread.","Adjust opacity and color, then preview the shadow on a sample card.","Copy the resulting box-shadow declaration into your stylesheet."],output:"A valid CSS box-shadow declaration with a live visual preview.",note:"Shadows may vary slightly between browser rendering engines."},
 'image-resizer':{why:"Fit a photo into a target maximum width and height without distorting it.",steps:["Select an image and review the uploaded preview and pixel dimensions.","Enter maximum width and height; the aspect ratio remains unchanged.","Resize and download the PNG, checking text and small details."],output:"A new correctly sized PNG with preserved aspect ratio.",note:"Upscaling increases pixels, not genuine visual detail or camera sharpness."},
 'image-rotator':{why:"Correct picture orientation or mirror an image for presentation.",steps:["Choose a JPG or PNG image and check its initial preview.","Select a quarter turn, half turn or horizontal or vertical flip.","Apply the transformation and download the resulting PNG."],output:"A rotated or mirrored copy without modifying the original file.",note:"The export is a PNG and original EXIF metadata may not be preserved."},
 'image-compressor':{why:"Adjust image encoding to try reducing file size or converting formats.",steps:["Choose an image and check its dimensions and source file size.","Select JPG, WebP or PNG and adjust quality for lossy formats.","Download, compare the new size and inspect fine details at full zoom."],output:"A newly encoded image with its actual before-and-after sizes.",note:"PNG is lossless and may be larger; there is no guaranteed target-size mode yet."},
 'merge-pdf':{why:"Combine multiple PDF documents into one page-preserving file.",steps:["Choose two to twelve PDFs and review the file names in upload order.","Keep files in the desired sequence; the current tool does not drag-reorder.","Merge and inspect the resulting pages in a PDF reader."],output:"One merged PDF with source pages copied without rasterizing.",note:"Password-protected documents must first be unlocked with permission."},
 'split-pdf':{why:"Save selected PDF pages as separate documents inside a ZIP file.",steps:["Upload the source PDF and inspect its page count in your reader.","Leave pages blank for every page, or enter a comma-separated page range.","Split and extract the ZIP to access each individual page PDF."],output:"A ZIP of individual PDF page files up to 200 pages.",note:"Individual files preserve page data but do not retain complex inter-page links."},
 'rotate-pdf':{why:"Turn sideways or upside-down PDF pages without blurring their content.",steps:["Upload a PDF document that does not require a password.","Choose a 90°, 180° or 270° rotation and the pages to affect.","Rotate and check the output orientation in a PDF viewer."],output:"A new PDF with updated page rotations, not image re-rendering.",note:"Only quarter turns are supported; arbitrary tilt correction is not included."},
 'crop-pdf':{why:"Reduce the visible margins of a PDF without changing the underlying text.",steps:["Upload a PDF and identify which edge needs less visible white space.","Enter the millimetres to hide at the top, bottom, left and right.","Crop and inspect each intended page in a viewer after export."],output:"A PDF with adjusted CropBox metadata on selected pages.",note:"Cropping only HIDES content; never use it to remove confidential information."},
 'remove-pdf-pages':{why:"Remove unwanted PDF pages while preserving the remaining pages.",steps:["Upload the PDF and note the numbered pages that should be removed.","Enter the pages such as 1, 3-5 without selecting every page.","Remove and verify the resulting page count and sequence."],output:"One updated PDF containing the pages you chose to keep.",note:"At least one page must remain and password-protected inputs are unsupported."},
 'extract-pdf-pages':{why:"Create a new PDF containing only the selected page numbers.",steps:["Upload a PDF and identify the pages to keep in the new file.","Enter the desired order such as 5, 1-3 in the page field.","Extract and check the saved PDF page order and quality."],output:"One new PDF of copied source pages in the specified order.",note:"The same page listed twice appears only once in the new document."},
 'pdf-to-text':{why:"Read the selectable text layer from a PDF into a plain text file.",steps:["Choose a PDF that contains ordinary selectable text instead of scans.","Run Extract and download text to read all available text items.","Open the downloaded TXT and check the order of extracted paragraphs."],output:"A local UTF-8 text file plus a visible extraction preview.",note:"Text layout and columns can be reordered; scanned documents require OCR."},
 'pdf-to-image':{why:"Turn PDF pages into portable JPEG or PNG pictures.",steps:["Upload a PDF and choose a suitable resolution for screen or print.","Choose JPG for photos or PNG for sharp interface graphics.","Render and extract the resulting ZIP of image files."],output:"One image per page bundled into a ZIP on your device.",note:"Rendered pages become pictures and no longer contain selectable text."},
 'jpg-to-pdf':{why:"Combine a group of picture files into a PDF for sharing or printing.",steps:["Choose one to thirty JPG or PNG images and confirm their order.","Choose A4 portrait or an individual page size that fits each image.","Create the PDF and confirm all pictures are included."],output:"A PDF with one visual page per selected image.",note:"Images are not editable PDF text and PNG embedding can increase size."},
 'pdf-page-numbers':{why:"Add visible page labels to a PDF for study and printing.",steps:["Choose the PDF and select the position for its page numbers.","Choose the first number and whether to skip the cover page.","Add numbers and inspect the final document in a PDF reader."],output:"A copy of your PDF with stamped page number labels.",note:"Number stamps do not change page order or PDF bookmark structure."},
 'teleprompter':{why:"Read a prepared speech while the words scroll smoothly on screen.",steps:["Paste your script and choose an appropriate reading speed and text size.","Choose a normal or mirrored view, then start the scroll and pause as needed.","Reset the position for another rehearsal and keep the script locally."],output:"A large dark readable script view with scrolling and mirror controls.",note:"Phone remote, voice-follow and recordings are not implemented in this first version."},
 'image-converter':{
  why:'Use this when a website needs JPG, PNG or WebP instead of the image format you have.',
  steps:['Upload, drop or paste one picture; confirm its original size in the preview.','Choose PNG (transparency), JPG (smaller photographs, no transparency) or WebP (modern compression), then set quality and optional width.','Select Convert & download. Open the saved file to check its appearance and size.'],
  output:'A new image in the chosen format. Your original file stays unchanged.',
  note:'Renaming a file extension alone does not convert an image. Animated files and unsupported image formats are not preserved.'},
 'image-enhancer':{
  why:'Use this for enlarging an image for a screen or mildly reducing visible noise, not for recovering lost visual evidence.',
  steps:['Upload a picture and inspect the original preview.','Choose dimensions; start with modest sharpening and noise smoothing, because strong values may look artificial.','Generate the output, compare the original and processed previews, and inspect the downloaded PNG at full size.'],
  output:'A resized PNG with optional local sharpening and smoothing.',
  note:'Full HD describes pixel dimensions only. This is not AI reconstruction, deblurring or a guarantee of new genuine detail.'},
 'pixel-art':{
  why:'Turn a photo, illustration or logo into playful retro-style artwork.',
  steps:['Upload or paste a clear image, then review its original thumbnail before editing.','Use Pixel block size for larger or smaller square blocks; reduce color steps for a simpler palette.','Create pixel art and save the generated PNG.'],
  output:'A stylized raster picture; the source remains intact.',
  note:'Small text and thin lines may become unreadable at large block sizes.'},
 'image-inspector':{
  why:'Understand the technical properties of a picture before sharing or processing it.',
  steps:['Upload a JPG or PNG (or another supported image) and check its preview.','Select Inspect image to read size, dimensions, format signature, SHA-256 hash and any embedded metadata available.','Interpret timestamps, camera fields or GPS tags cautiously. A missing tag means it was not found, not that the event never happened.'],
  output:'A detailed local technical report, not a verification of authenticity.',
  note:'Metadata can be changed or stripped. It cannot identify a person or establish the genuine origin of an image.'},
 'watermark':{
  why:'Add a visible ownership or draft label to a picture.',
  steps:['Choose your image and see the original.','Type the watermark text, choose its location, size and opacity.','Apply the watermark; inspect the result before sharing the downloaded file.'],
  output:'A new PNG with your watermark painted into the image.',
  note:'A watermark does not prevent others from copying or altering the image.'},
 'image-cropper':{
  why:'Keep only the area of a picture you want to show.',
  steps:['Upload and note the original image dimensions.','Enter the crop starting point X/Y and width/height in pixels, counting from the upper-left corner.','Crop and download the new PNG; if the area is wrong, adjust the values and run it again.'],
  output:'A PNG showing only the selected rectangular part.',
  note:'This is coordinate-based cropping, not a freehand drag selection.'},
 'icon-maker':{
  why:'Prepare the same logo at several sizes for browser, website or design tasks.',
  steps:['Upload a logo or square artwork, preferably with a transparent background.','Select Generate icon ZIP. The tool resizes the original into the listed PNG sizes.','Extract the ZIP and select the sizes required by your target platform.'],
  output:'A ZIP containing eight resized PNG images.',
  note:'This does not automatically create Android adaptive icons, iOS asset catalogs or a complete favicon manifest.'},
 'image-to-ascii':{
  why:'Produce text-based artwork from an image, useful for creative experiments.',
  steps:['Upload your picture and check the original preview to understand its shape and brightness.','Choose how many characters appear in each line and the character palette.','Generate, review the text artwork, and save the output.'],
  output:'Editable plain-text ASCII-style artwork.',
  note:'Results are visual interpretations, and may look different depending on the font used to view them.'},
 'background-remover':{
  why:'Make a simple plain-color background transparent, such as a logo on a white backdrop.',
  steps:['Choose an image with a fairly uniform background, then preview it.','Pick the background color. Increase Color tolerance only enough to remove similar shades; Edge softness fades the boundary gradually.','Select Remove background and inspect the transparent PNG, especially around hair, fine edges and similarly colored objects.'],
  output:'A PNG with pixels near the selected background color made transparent.',
  note:'This is color removal, not AI object selection. Similar foreground colors can be removed too.'},
 'collage-maker':{
  why:'Combine several photographs into one shareable arrangement.',
  steps:['Choose or drop multiple pictures and confirm the thumbnails.','Select how many columns to use, each square tile size, and the gaps between tiles.','Generate the collage and check that important areas were not cropped away.'],
  output:'One combined PNG collage.',
  note:'Pictures are cropped to fill square tiles, so parts near image edges may disappear.'},
 'emoji-art':{
  why:'Create a fun emoji-themed mosaic based on a picture.',
  steps:['Upload a photo and confirm its thumbnail before choosing your emoji symbols.','Enter the emoji symbols you want and choose the number of tiles across the image.','Generate the artwork; experiment with other emoji and tile settings for a different look.'],
  output:'A decorative PNG mosaic using the selected emoji.',
  note:'It is not an exact recreation of the source image, and emoji shapes differ among devices.'},
 'color-inspector':{
  why:'Find a color code from a photo, brand palette or manually chosen color.',
  steps:['Select a color using the swatch, or upload an image.','Click a point on the preview to sample the color at that location.','Copy the HEX, RGB, HSL or approximate CMYK values and check contrast before using them for text.'],
  output:'Color codes and contrast readings for the selected sample.',
  note:'Screens and print devices reproduce colors differently; CMYK is an estimate, not a calibrated print profile.'},
 'image-compare':{
  why:'Check whether two images show the same pixels or contain visible differences.',
  steps:['Upload the original and the other version; review both previews.','Move the reveal slider to see one version overlaid on the other.','Choose Compare images to create a difference map and percentage; inspect red regions manually.'],
  output:'A comparison view and a downloadable red/grey difference map.',
  note:'Red means a pixel difference, not a mistake. Compression, image movement and resizing can create red even with no intentional edit.'},
 'file-converter':{
  why:'Change a supported document into a different usable format, choosing between editability and visual appearance.',
  steps:['Upload a PDF, DOCX or image with the type required by the selected mode.','Read the conversion description carefully: Word with PDF page pictures keeps appearance but cannot edit words; extracted text is editable but loses layout.','Convert or open the printable preview, then compare the result with the original before using it.'],
  output:'A format-specific download, or a print-to-PDF preview for the DOCX print mode.',
  note:'Not a high-fidelity universal Office converter. Scanned PDFs need OCR and PDF-to-Excel is only an approximation.'},
 'compare':{
  why:'Review a draft against its previous version to see what changed, including accidental-looking number edits.',
  steps:['Choose original and updated text files or paste their contents into the two boxes.','Select Find differences to compare the extracted text line by line.','Read the added/removed lines and conclusion; double-check dates, amounts, names and IDs in the source files.'],
  output:'A side-by-side text comparison with cautious summary, not automatic verification of correctness.',
  note:'For Word/PDF it compares extracted text, not fonts, spacing, embedded pictures or exact page layout.'},
 'csv-cleaner':{
  why:'Remove redundant rows and extra whitespace from a CSV spreadsheet.',
  steps:['Upload a CSV and inspect the excerpt.','Choose whether to trim the outer spaces in cells and remove duplicate data rows.','Clean, inspect the summary, and download a new CSV while keeping the original.'],
  output:'A cleaned CSV file with a count of changed/removed rows.',
  note:'The first row is treated as a header; equivalent but differently formatted values are not automatically corrected.'},
 'text-extractor':{
  why:'Copy writing from a screenshot, scan or other image instead of typing it manually.',
  steps:['Upload an image containing readable text.','Choose English or Bahasa Melayu and run optical character recognition (OCR).','Read the extracted text carefully, correct mistakes, then download it.'],
  output:'Editable text interpreted from the image.',
  note:'Handwriting, small text and blurry scans may be misread. The first use requires model downloads.'},
 'pdf-editor':{
  why:'Add new labels or notes to a PDF without modifying its existing text.',
  steps:['Choose a PDF, enter the page number and load the preview.','Type your note, choose font size/color, then click the exact location on the page preview.','Save the annotated PDF and inspect the downloaded page.'],
  output:'A new PDF with extra text placed on its pages.',
  note:'This tool does not let you rewrite or remove existing PDF text; added annotations are not a full Word-style editor.'},
 'pdf-organizer':{
  why:'Rearrange the pages of one or more PDF documents.',
  steps:['Upload one or several PDF files, making sure they are not password-protected.','Load their pages, then use the page controls to move, rotate or remove pages.','Export the organized PDF and confirm its page order.'],
  output:'One PDF containing the selected pages in your chosen order.',
  note:'This edits page order, not text within the pages. Back up originals before removing pages.'},
 'pdf-watermark':{
  why:'Mark a PDF as draft, confidential or for review.',
  steps:['Choose the PDF to mark, and check that it is the correct document.','Enter the watermark text and adjust size, opacity, color and top/center/bottom position.','Apply to all pages, then inspect the exported document.'],
  output:'A new PDF with the same visible watermark added to each page.',
  note:'Visible watermarks do not encrypt PDFs or technically prevent copying.'},
 'json-studio':{
  why:'Read and verify JSON used for web APIs, configuration or data exchange.',
  steps:['Paste the JSON data into the source text area, including all braces and quotes.','Choose Validate, Prettify (indented) or Minify (compact).','Review the result or syntax error, then copy or download the text.'],
  output:'Validated and reformatted JSON or a specific syntax error.',
  note:'Valid JSON syntax does not mean the data is factually correct or matches an API schema.'},
 'markdown-editor':{
  why:'Write README files, notes and documentation using plain-text formatting.',
  steps:['Edit the sample text: # creates a heading, **text** becomes bold and - starts a bullet.','Check the live preview on the other side for formatting mistakes.','Download the .md file for GitHub or another Markdown-compatible editor.'],
  output:'A Markdown source file; not a Word document or hosted website.',
  note:'The preview supports a small Markdown subset; advanced Markdown features may render differently elsewhere.'},
 'qr-generator':{
  why:'Create a scannable picture that contains a website link or short text.',
  steps:['Enter the link or text exactly as you want it encoded.','Choose the square size and contrasting dark/light colors.','Generate, scan it with a phone to confirm the content, then download PNG.'],
  output:'A QR-code PNG generated on this device.',
  note:'A QR code contains its data; it does not automatically shorten links or count visits.'},
 'password-generator':{
  why:'Generate an unpredictable password for a new login or account.',
  steps:['Choose a length (longer is generally stronger) and the character groups to allow.','Select Generate password, then copy the result.','Store it safely in your password manager instead of reusing it across accounts.'],
  output:'A password generated using the browser cryptographic random generator.',
  note:'The app does not save or recover the generated password later.'},
 'utm-builder':{
  why:'Label marketing links so compatible analytics can distinguish visitors from different campaigns.',
  steps:['Enter the destination website URL with https://.','Set source (where), medium (channel type), and campaign (group); use optional term/content for detail.','Build and copy the URL, then test that it opens the intended website.'],
  output:'A normal URL with utm_source, utm_medium and utm_campaign parameters added.',
  note:'It does not count clicks or guarantee analytics recording. Your website needs analytics configured separately.'},
 'invoice-generator':{
  why:'Prepare a simple PDF invoice for a client without an account.',
  steps:['Enter the seller, customer, invoice number and currency.','Write one line per item as description | quantity | price; check tax and totals.','Generate the invoice PDF, open it and confirm all details before sending.'],
  output:'A printable invoice PDF with an itemized total.',
  note:'Check legal requirements, currency, tax and payment instructions yourself. The tool does not process payments.'},
 'text-tools':{
  why:'Quickly tidy or transform pasted text for documents and spreadsheets.',
  steps:['Paste your text into the input area.','Select uppercase, lowercase, trimming, deduplication, sorting or counting.','Process the text, then review and download the result.'],
  output:'Processed plain text, or counts of words, characters and lines.',
  note:'Some options intentionally alter content or order; always compare before replacing the source.'},
 'focus-timer':{
  why:'Break work or study into timed focus and rest sessions.',
  steps:['Choose a focus length and break length in minutes.','Start the timer; pause, resume, reset or switch modes when needed.','After a focus session ends, check the completed count stored in this browser.'],
  output:'A visual timer with basic local progress and completed-session count.',
  note:'This is not a guaranteed background alarm; if the device sleeps, return to the tab to refresh the display.'}
};

export const modeExplanations={
 'file-converter':{
  'pdf-appearance':'Keeps the visual appearance by embedding full PDF pages as pictures inside Word. You cannot edit the original words.',
  'pdf-docx':'Extracts selectable words into an editable Word document. Fonts, columns, images and page positioning are not preserved.',
  'pdf-xlsx':'Attempts to split extracted PDF text into rows and cells. Not a reliable table recovery tool; check every cell.',
  'docx-print':'Opens a printable preview; manually choose Print → Save as PDF. Review page breaks, images and tables.',
  'docx-pdf':'Converts extracted Word text into a very plain PDF. Complex formatting will not survive.',
  'image-pdf':'Places the selected picture on one PDF page without turning it into editable text.',
  'pdf-png':'Renders the selected PDF page to a PNG picture. Use Page number to select which page.'},
 'image-enhancer':{
  'fullhd':'Fit within 1920 × 1080 pixels, preserving aspect ratio. A small photo still lacks genuine fine detail.',
  'hd':'Fit within 1280 × 720 pixels, preserving aspect ratio.',
  '4k':'Fit within 3840 × 2160 pixels. Larger files do not mean new authentic detail.',
  '2':'Double original width and height, which quadruples the total pixel count.',
  '3':'Triple original width and height, which multiplies total pixels by nine.',
  '1':'Keep the original dimensions; apply only sharpening and/or smoothing.'},
 'image-converter':{
  'image/png':'Lossless PNG is suitable for logos or images needing transparency; output may be larger.',
  'image/jpeg':'JPG is useful for photographs; transparent parts become white.',
  'image/webp':'WebP often makes smaller images and can preserve transparent areas.'},
 'text-tools':{
  'upper':'Change every alphabetic letter to uppercase (ABC).', 'lower':'Change every alphabetic letter to lowercase (abc).',
  'title':'Capitalize the first letter of many words; review names and acronyms.',
  'trim':'Remove surrounding spaces and blank lines.',
  'unique':'Remove completely identical repeated lines while keeping their first occurrence.',
  'sort':'Arrange lines in alphabetical order.',
  'reverse':'Put the last line first and the first line last.',
  'count':'Show word, character and line counts without changing the source.'}
};
