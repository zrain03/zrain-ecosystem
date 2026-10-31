// One-time production endpoints are set after the Render API and Cloudflare catalog are healthy.
// Production intentionally fails closed while these URLs are blank.
const LOCAL = typeof location !== "undefined" &&
  ["localhost","127.0.0.1"].includes(location.hostname);
const PRODUCTION_API_URL = "";       // https://<verified-render-service>.onrender.com
const PRODUCTION_CATALOG_URL = "";   // https://<verified-cloudflare-worker>.workers.dev/api/catalog
export const API_BASE_URL = LOCAL ? "http://localhost:8080" : PRODUCTION_API_URL;
export const PUBLIC_CATALOG_URL = LOCAL ? "http://localhost:8080/api/products" : PRODUCTION_CATALOG_URL;
export const ENABLE_DYNAMIC_CATALOG = Boolean(PUBLIC_CATALOG_URL);
export const LOCAL_PREVIEW = LOCAL;
