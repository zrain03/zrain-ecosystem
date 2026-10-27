/**
 * All preview destinations are explicit Zrain websites. External websites are
 * never accepted from query strings, URL fragments or user-provided input.
 * Website embedding depends on the target's own browser/security headers.
 */
export const PRODUCTS = Object.freeze({
  "guess-the-flag": Object.freeze({
    name: "Guess The Flag", kind: "mobile",
    icon: "/icons/guess-the-flag.webp",
    description: "Explore flags and countries with the playable Flutter Web edition.",
    webUrl: "https://guesstheflag-zrain.web.app/",
    storeUrl: "https://play.google.com/store/apps/details?id=com.zrain.guesstheflag"
  }),
  "memory-rush": Object.freeze({
    name: "Memory Rush", kind: "mobile",
    icon: "/icons/memory-rush.webp",
    description: "Play Grid Recall, Number Recall and Pattern Recall online.",
    webUrl: "https://memoryrush-zrain.web.app/",
    storeUrl: "https://play.google.com/store/apps/details?id=com.zrain.memoryrush"
  }),
  "zrain-auth-starter": Object.freeze({
    name: "Zrain Auth Starter", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Explore the Spring Boot JWT starter and safe browser playground.",
    webUrl: "https://zrain03.github.io/zrain-auth-starter/",
    repositoryUrl: "https://github.com/zrain03/zrain-auth-starter"
  }),
  "zrain-links": Object.freeze({
    name: "Zrain Links", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Create custom links, QR previews and visits links.",
    webUrl: "https://zrain-links.web.app/"
  })
});
