/**
 * generate-icons.mjs
 * ─────────────────────────────────────────────────────────────────
 * Regenerates the full favicon / app-icon set from the brand SVGs.
 *
 *   Sources : public/favicon.svg          (rounded, for favicons/apple)
 *             public/icon-maskable.svg     (full-bleed, for PWA maskable)
 *   Run     : node scripts/generate-icons.mjs
 *
 * Commit the generated files. Re-run whenever the brand mark changes.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");
const faviconSvg = path.join(pub, "favicon.svg");
const maskableSvg = path.join(pub, "icon-maskable.svg");

// [source svg, output filename, size]
const targets = [
  [faviconSvg, "favicon-16x16.png", 16],
  [faviconSvg, "favicon-32x32.png", 32],
  [faviconSvg, "favicon-48x48.png", 48],
  [faviconSvg, "apple-touch-icon.png", 180], // iOS home screen
  [faviconSvg, "icon-192.png", 192], // PWA (any)
  [faviconSvg, "icon-512.png", 512], // PWA (any)
  [maskableSvg, "icon-192-maskable.png", 192], // PWA (maskable)
  [maskableSvg, "icon-512-maskable.png", 512], // PWA (maskable)
];

async function run() {
  for (const [src, name, size] of targets) {
    const out = path.join(pub, name);
    await sharp(src, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // Multi-resolution favicon.ico (16/32/48) for legacy + bookmarks
  const icoPngs = await Promise.all(
    [16, 32, 48].map((s) =>
      sharp(faviconSvg, { density: 384 }).resize(s, s).png().toBuffer()
    )
  );
  const ico = await pngToIco(icoPngs);
  fs.writeFileSync(path.join(pub, "favicon.ico"), ico);
  console.log("✓ favicon.ico (16/32/48)");

  console.log("Icon set generated.");
}

run().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
