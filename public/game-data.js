/*
 * Fail / File: public/game-data.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menghimpunkan metadata permainan dan pautan Google Play yang rasmi.
 * EN: Collects game metadata and official Google Play destinations.
 */
/** Source URLs are the named Firebase Hosting web targets of Zrain's two Flutter games. */
export const GAMES = Object.freeze({
  "guess-the-flag": Object.freeze({
    name: "Guess the Flag",
    description: "Test your geography knowledge with the browser version of Guess the Flag.",
    webUrl: "https://guesstheflag-zrain.web.app/",
    storeUrl: "https://play.google.com/store/apps/details?id=com.zrain.guesstheflag"
  }),
  "memory-rush": Object.freeze({
    name: "Memory Rush",
    description: "Play Grid Recall, Number Recall and Pattern Recall in your browser.",
    webUrl: "https://memoryrush-zrain.web.app/",
    storeUrl: "https://play.google.com/store/apps/details?id=com.zrain.memoryrush"
  })
});
