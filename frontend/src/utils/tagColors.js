/**
 * tagColors.js
 * Deterministic per-tag color so a given tag always looks the same.
 * Returns inline styles tuned for the app's dark UI.
 */
export function tagStyle(tag) {
  const t = String(tag || "");
  let h = 0;
  for (let i = 0; i < t.length; i++) {
    h = (h * 31 + t.charCodeAt(i)) % 360;
  }
  return {
    color: `hsl(${h} 70% 78%)`,
    backgroundColor: `hsl(${h} 55% 50% / 0.14)`,
    borderColor: `hsl(${h} 55% 60% / 0.30)`,
  };
}

/** Normalize a raw tag string the same way the backend does. */
export function normalizeTag(raw) {
  return String(raw || "").trim().replace(/\s+/g, " ").slice(0, 30);
}
