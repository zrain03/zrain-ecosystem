/*
 * Fail / File: public/zrain-ui-config.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyambungkan shared Zrain UI kepada seksyen homepage tanpa mengulang komponen header.
 * EN: Connects shared Zrain UI to homepage sections without duplicating header components.
 */
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

  // BM: updateActiveNav: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menyambungkan shared Zrain UI kepada seksyen homepage tanpa mengulang komponen header.
  // EN: updateActiveNav: Mutates relevant state only after input and access conditions are verified. Module purpose: connects shared Zrain UI to homepage sections without duplicating header components.
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
  // BM: scheduleNavUpdate: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyambungkan shared Zrain UI kepada seksyen homepage tanpa mengulang komponen header.
  // EN: scheduleNavUpdate: Isolates one operation so it can be reviewed and tested. Module purpose: connects shared Zrain UI to homepage sections without duplicating header components.
  function scheduleNavUpdate() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      updateActiveNav();
    });
  }

  // BM: Event scroll: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: scroll event: handle interaction without mutating source data or bypassing module validation.
  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate);
  window.addEventListener("hashchange", scheduleNavUpdate);
  window.addEventListener("load", scheduleNavUpdate);
  scheduleNavUpdate();
}
