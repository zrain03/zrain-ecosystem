/*
 * Fail / File: tool-runtime/src/discovery.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa.
 * EN: Performs safe tool discovery including input normalization and multilingual ranking.
 */
// Zrain-owned discovery metadata, deliberately independent from tool implementations.
// No external search service, account or remote data request is used.
import {catalog, groups, findGroup} from './catalog.mjs';
export const storageKey='zrain-tools-favourites-v1';
export const recentKey='zrain-tools-last-used-v1';
export const popularSlugs=['image-converter','pdf-organizer','compare','color-inspector','qr-generator','image-inspector'];
const terms={
 'base64-tool':'base64 converter encode and decode real utf-8 text using standard or url-safe base64.',
 'jwt-decoder':'jwt decoder inspect jwt header and payload without sending tokens to a server.',
 'word-counter':'word counter count words, characters, lines, sentences and reading time.',
 'hash-generator':'sha hash generator calculate sha-256, sha-384 or sha-512 on local text.',
 'uuid-generator':'uuid generator generate cryptographically random uuid v4 or sortable v7 ids.',
 'css-shadow-generator':'css shadow generator preview a css box-shadow and copy its declaration.',
 'image-resizer':'resize image resize photos to fit selected maximum pixel dimensions.',
 'image-rotator':'rotate & flip image rotate 90°, 180° or 270°, or flip a picture.',
 'image-compressor':'compress image re-encode an image with adjustable jpeg, webp or png quality.',
 'merge-pdf':'merge pdf combine two or more pdf files without rasterizing their pages.',
 'split-pdf':'split pdf split selected pdf pages into individual pdfs inside a zip.',
 'rotate-pdf':'rotate pdf rotate chosen pdf pages without re-rendering.',
 'crop-pdf':'crop pdf trim visible page margins in millimetres using the pdf crop box.',
 'remove-pdf-pages':'remove pdf pages remove selected pages, keeping the rest in order.',
 'extract-pdf-pages':'extract pdf pages copy chosen pdf pages into a new pdf in the order selected.',
 'pdf-to-text':'pdf to text extract selectable text from pdf pages to a txt file.',
 'pdf-to-image':'pdf to images render pdf pages to jpg or png and download them as zip.',
 'jpg-to-pdf':'jpg & png to pdf create a pdf from up to 30 jpg or png pictures.',
 'pdf-page-numbers':'pdf page numbers add page numbers to a pdf, optionally skipping its cover page.',
 'teleprompter':'teleprompter scroll a speech script at an adjustable speed with a mirror option.',

 'image-converter':'tukar gambar ubah format gambar webp png jpg jpeg convert photo',
 'file-converter':'tukar dokumen pdf word docx excel xlsx office resume cv tukar fail',
 'image-enhancer':'tajam jelas resolusi kabur enhance gambar hd upscale fhd',
 'pdf-editor':'edit pdf tambah tulisan anotasi teks',
 'color-inspector':'warna kod color picker palet hex rgb hsl cmyk contrast',
 'compare':'banding dokumen perbezaan compare teks changes salah teredit',
 'emoji-art':'emoji mozek mosaic fun kreatif',
 'background-remover':'buang latar belakang transparent potong background',
 'collage-maker':'gabung gambar kolaj grid photo',
 'image-inspector':'metadata exif osint sha256 info gambar camera gps properties',
 'pixel-art':'pixel lukisan retro gambar',
 'pdf-organizer':'gabung pdf asing halaman susun putar merge split reorder rotate pages',
 'image-compare':'banding gambar difference pixel berubah',
 'watermark':'watermark tanda hak cipta gambar',
 'image-cropper':'crop gambar potong nisbah aspect ratio',
 'icon-maker':'icon favicon logo saiz aplikasi',
 'pdf-watermark':'watermark pdf cap dokumen',
 'text-extractor':'extract text OCR gambar screenshot baca teks',
 'image-to-ascii':'ascii seni teks gambar',
 'json-studio':'json format validate developer minify kemas json',
 'csv-cleaner':'csv data duplicates buang pendua excel spreadsheet',
 'invoice-generator':'invois resit bil receipt invoice',
 'markdown-editor':'markdown readme github md dokumentasi',
 'qr-generator':'qr kod qr code link scan',
 'text-tools':'teks ayat uppercase lowercase spaces trim perkataan',
 'focus-timer':'pomodoro fokus masa study timer break rehat belajar',
 'password-generator':'password kata laluan random secret secure',
 'utm-builder':'utm kempen tracking marketing instagram newsletter analytics link'
};
const all=new Map(catalog.map(row=>[row[0],row]));
// BM: groupTools: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: slug.
// EN: groupTools: Isolates one operation so it can be reviewed and tested. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: slug.
export function groupTools(slug){
 const group=groups.find(g=>g.slug===slug);
 return group?group.sections.flatMap(s=>s.tools):catalog.map(row=>row[0]);
}
export function toolHref(slug, groupSlug){
 const g=findGroup(slug);if(!g)return '#';
 // An independent group deploy never assumes other group folders exist.
 return groupSlug?`./${slug}/index.html`:`./${g.slug}/${slug}/index.html`;
}
// BM: searchTools: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: query='',groupSlug='',limit=catalog.length.
// EN: searchTools: Isolates one operation so it can be reviewed and tested. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: query='',groupSlug='',limit=catalog.length.
export function searchTools(query='',groupSlug='',limit=catalog.length){
 const allowed=new Set(groupTools(groupSlug));
 const q=String(query).trim().toLocaleLowerCase('ms-MY').normalize('NFKD');
 const words=q.split(/\s+/).filter(Boolean);
 return catalog.filter(row=>{
  if(!allowed.has(row[0]))return false;
  if(!words.length)return true;
  const g=findGroup(row[0]);const haystack=[row[0],row[1],row[2],row[4],g?.title,terms[row[0]]].join(' ').toLocaleLowerCase('ms-MY').normalize('NFKD');
  return words.every(w=>haystack.includes(w));
 }).slice(0,Math.max(0,limit));
}
// BM: safeRead: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: storage,key.
// EN: safeRead: Isolates one operation so it can be reviewed and tested. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: storage,key.
export function safeRead(storage,key){
 try {const raw=storage?.getItem(key);return raw?JSON.parse(raw):null}catch{return null}
}
export function getFavourites(storage){
 const list=safeRead(storage,storageKey);
 return Array.isArray(list)?[...new Set(list.filter(s=>typeof s==='string'&&all.has(s)))]:[];
}
// BM: setFavourite: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: storage,slug,enabled.
// EN: setFavourite: Isolates one operation so it can be reviewed and tested. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: storage,slug,enabled.
export function setFavourite(storage,slug,enabled){
 if(!all.has(slug))return getFavourites(storage);
 const next=new Set(getFavourites(storage));
 if(enabled)next.add(slug);else next.delete(slug);
 try{storage?.setItem(storageKey,JSON.stringify([...next]))}catch{};
 return [...next];
}
// BM: recordTool: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: storage,slug.
// EN: recordTool: Isolates one operation so it can be reviewed and tested. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: storage,slug.
export function recordTool(storage,slug){
 if(!all.has(slug))return;
 try{const old=safeRead(storage,recentKey);const next=[slug,...(Array.isArray(old)?old:[]).filter(x=>x!==slug&&all.has(x))].slice(0,8);storage?.setItem(recentKey,JSON.stringify(next))}catch{}
}
export function recentTools(storage,groupSlug=''){
 const rec=safeRead(storage,recentKey);
 const allow=new Set(groupTools(groupSlug));
 return Array.isArray(rec)?rec.filter(s=>allow.has(s)&&all.has(s)).slice(0,5):[];
}
// BM: getTool: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menjalankan carian tool yang selamat, termasuk normalisasi input dan ranking merentas bahasa. Input: slug.
// EN: getTool: Reads relevant records and returns a bounded result to the caller. Module purpose: performs safe tool discovery including input normalization and multilingual ranking. Inputs: slug.
export function getTool(slug){return all.get(slug)||null}
