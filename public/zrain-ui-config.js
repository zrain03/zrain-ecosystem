import { mountZrainUI } from "./zrain-ui.js?v=brand-20261029-footeronly";

// The shared component owns brand identity; this site owns its section navigation.
export function chooseActiveSection(sections, viewportHeight, headerBottom) {
  const readingLine = Math.max(headerBottom + 24, viewportHeight * 0.42);
  const contactLine = Math.max(readingLine, viewportHeight * 0.74);
  let active = null;

  for (const section of sections) {
    const trigger = section.id === "contact" ? contactLine : readingLine;
    if (section.id === "contact" && section.top <= trigger) {
      active = section.id; // Keep Contact selected when the footer is reached.
    } else if (section.top <= trigger && section.bottom > headerBottom) {
      active = section.id;
    }
  }
  return active;
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  mountZrainUI({
    product: "Ecosystem",
    logoSrc: "/zrain-logo.webp",
    productHref: "#top",
    navigation: [
      { label: "Products", href: "#products" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" }
    ],
    footerLinks: [
      { label: "Products", href: "#products" },
      { label: "Contact", href: "mailto:zrain.dev@gmail.com" },
      { label: "GitHub", href: "https://github.com/zrain03", external: true }
    ]
  });

  const header = document.querySelector(".zrain-header");
  const navItems = ["products", "about", "contact"].map(id => ({
    id,
    section: document.getElementById(id),
    link: document.querySelector(`.zrain-header .main-nav a[href="#${id}"]`)
  })).filter(item => item.section && item.link);

  function updateActiveNav() {
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const positions = navItems.map(item => ({
      id: item.id,
      top: item.section.getBoundingClientRect().top,
      bottom: item.section.getBoundingClientRect().bottom
    }));
    const active = chooseActiveSection(positions, window.innerHeight, headerBottom);

    for (const item of navItems) {
      const isActive = item.id === active;
      item.link.classList.toggle("current", isActive);
      if (isActive) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    }
  }

  let queued = false;
  function scheduleNavUpdate() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      updateActiveNav();
    });
  }

  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate);
  window.addEventListener("hashchange", scheduleNavUpdate);
  window.addEventListener("load", scheduleNavUpdate);
  scheduleNavUpdate();
}
