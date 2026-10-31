// Production is disabled until the actual backend deployment and 6-product migration are verified.
// Local development uses a Java API at http://localhost:8080, never a production HTTP origin.
const LOCAL = typeof location !== "undefined" && ["localhost", "127.0.0.1"].includes(location.hostname);
export const API_BASE_URL = LOCAL ? "http://localhost:8080" : "";
// Preview published admin products on localhost only. Never activate automatically on zrain.web.app.
export const ENABLE_DYNAMIC_CATALOG = LOCAL && Boolean(API_BASE_URL);
