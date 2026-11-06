/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * Fail / File: src/pdf-reorder.mjs
 * BM: Alih satu halaman terus ke mana-mana posisi tanpa mengubah sumber PDF.
 * EN: Reorder a page to any destination without altering its source PDF.
 */
export function movePdfPage(pages,from,to){
 if(!Array.isArray(pages)||![from,to].every(Number.isInteger)||from<0||to<0||from>=pages.length||to>=pages.length)throw Error('Invalid page position.');
 if(from===to)return pages;
 const [page]=pages.splice(from,1);pages.splice(to,0,page);
 return pages;
}
