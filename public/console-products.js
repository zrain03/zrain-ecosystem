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
  }),
  "zrain-monitor": Object.freeze({
    name: "Zrain Monitor", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Monitor public HTTPS services, inspect incidents and view uptime diagnostics.",
    webUrl: "https://zrain-monitor.web.app/"
  }),
  "zrain-image-tools": Object.freeze({
    name: "Zrain Image Tools", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Convert, inspect, improve and create with images.",
    webUrl: "https://zrain-image-tools.pages.dev/"
  }),
  "zrain-pdf-tools": Object.freeze({
    name: "Zrain PDF Tools", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Edit, merge, organize and watermark PDF pages.",
    webUrl: "https://zrain-pdf-tools.pages.dev/"
  }),
  "zrain-document-tools": Object.freeze({
    name: "Zrain Document Tools", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Convert files, compare text, extract OCR and clean CSV data.",
    webUrl: "https://zrain-document-tools.pages.dev/"
  }),
  "zrain-developer-tools": Object.freeze({
    name: "Zrain Developer Tools", kind: "web",
    icon: "/zrain-logo.webp",
    description: "JSON, Markdown, QR codes, passwords and UTM campaign links.",
    webUrl: "https://zrain-developer-tools.pages.dev/"
  }),
  "zrain-productivity-tools": Object.freeze({
    name: "Zrain Productivity Tools", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Invoice generation, text utilities and a focus timer.",
    webUrl: "https://zrain-productivity-tools.pages.dev/"
  }),
  "zrain-ui": Object.freeze({
    name: "Zrain UI", kind: "web",
    icon: "/zrain-logo.webp",
    description: "Explore the shared Zrain header, footer and design system showcase.",
    webUrl: "https://zrain.web.app/zrain-ui-showcase.html",
    externalUrl: "https://github.com/zrain03/zrain-ui",
    repositoryUrl: "https://github.com/zrain03/zrain-ui"
  })
});
