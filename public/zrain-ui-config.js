import { mountZrainUI } from "./zrain-ui.js?v=brand-20261029-footeronly";

// Product configuration only. The official Zrain UI package stays untouched.
mountZrainUI({
  product: "Ecosystem",
  logoSrc: "/zrain-logo.webp",
  productHref: "#top",
  navigation: [
    { label: "Products", href: "#products", current: true },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ],
  footerLinks: [
    { label: "Products", href: "#products" },
    { label: "Contact", href: "mailto:zrain.dev@gmail.com" },
    { label: "GitHub", href: "https://github.com/zrain03", external: true }
  ]
});
