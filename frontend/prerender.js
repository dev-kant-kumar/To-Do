import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FAQ_ITEMS } from "./src/data/faq.js";

const SITE = "https://todo.devkantkumar.com";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const templatePath = path.join(distDir, "index.html");

if (!fs.existsSync(templatePath)) {
  console.error("Vite build output not found! Please run 'npm run build' first.");
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf-8");

const routes = {
  "login": {
    title: "Sign In | todo.",
    description: "Access your personal workspace on todo. to manage tasks, review starred items, and organize your schedules."
  },
  "sign-up": {
    title: "Create an Account | todo.",
    description: "Join todo. today. Set up your workspace, track your tasks, and achieve your goals with our modern task manager."
  },
  "forgot-password": {
    title: "Forgot Password | todo.",
    description: "Recover your account on todo.. Enter your email address to receive a secure password reset link."
  },
  "reset-password": {
    title: "Reset Password | todo.",
    description: "Create a new secure password for your account on todo. and get back to managing your day."
  },
  "home": {
    title: "Dashboard | todo.",
    description: "Manage your tasks, filter by Starred, Today, or Deleted, and track your daily lists on todo..",
    image: "/og-img-v2.png"
  },
  "profile": {
    title: "Settings | todo.",
    description: "Update your personal information, manage security, and configure your todo. profile.",
    image: "/og-img-v1.png"
  },
  "planner": {
    title: "Planner | todo.",
    description: "Plan your week and month tasks visually on a modern calendar view.",
    image: "/og-img-v3.png"
  },
  "loader": {
    title: "Loading | todo.",
    description: "Setting up your workspace..."
  },
  "error": {
    title: "Page Not Found | todo.",
    description: "Oops! The page you are looking for does not exist on todo.."
  },
  "legal/terms-and-conditions": {
    title: "Terms & Conditions | todo.",
    description: "Read the terms of service and conditions for using todo. task management tools."
  },
  "legal/privacy-policy": {
    title: "Privacy Policy | todo.",
    description: "Learn how todo. protects and manages your personal data, verification info, and tasks."
  },
  "legal/cookie-policy": {
    title: "Cookie Policy | todo.",
    description: "Read about how todo. uses cookies and local storage to keep you logged in and personalize your settings."
  },
  "legal/delete-my-data": {
    title: "Delete My Data | todo.",
    description: "Request account deletion and complete erasure of your tasks, email, and user data from todo.."
  },
  "legal/disclaimer": {
    title: "Disclaimer | todo.",
    description: "Legal disclaimer and limitations of liability for the todo. productivity application."
  },
  "legal/refund-policy": {
    title: "Refund Policy | todo.",
    description: "Learn about billing policies, subscriptions, and refund eligibility for todo. accounts."
  },
  "legal/accessibility": {
    title: "Accessibility Statement | todo.",
    description: "Read about our commitment to making todo. accessible and user-friendly for everyone."
  }
};

console.log("Generating static routes for SEO and SSG...");

// ── Meta replacement (shared by every route) ─────────────────────────────────
function applyMeta(html, meta, route) {
  const url = `${SITE}/${route}`;
  const image = meta.image ? `${SITE}${meta.image}` : `${SITE}/og-img-vo.png`;
  return html
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/, `<meta name="description" content="${meta.description}" />`)
    .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/, `<meta property="og:title" content="${meta.title}" />`)
    .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/, `<meta property="og:description" content="${meta.description}" />`)
    .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${meta.title}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${meta.description}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`)
    .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
}

// ── Static, crawlable homepage content ───────────────────────────────────────
// The app mounts with createRoot().render(), which REPLACES #root on load, so
// this content is served to crawlers (and no-JS visitors) and then swapped out
// for the live React app the moment JS runs — no hydration, no mismatch.
const HOME_META = {
  title: "todo. — Free Gamified To-Do List & Task Manager with Streaks",
  description:
    "todo. is a free, gamified task manager: organize your to-do list, build daily streaks, earn XP, and set recurring tasks, subtasks, tags, and reminders — online or offline.",
  image: "/og-img-vo.png",
};

const FEATURES = [
  ["Gamified productivity", "Earn XP, level up, unlock badges, keep daily streaks alive, and climb the leaderboard."],
  ["Recurring tasks & reminders", "Repeat tasks daily, weekly, or monthly and get timely reminders so nothing slips."],
  ["Subtasks & checklists", "Break big tasks into smaller steps and track progress at a glance."],
  ["Tags & smart filters", "Label tasks and filter your list instantly by tag, priority, or status."],
  ["Works offline", "An installable PWA that keeps working without a connection and syncs when you are back online."],
  ["Visual planner", "Plan your week and month on a calendar and drag your backlog into place."],
];

function buildHomeContent() {
  const features = FEATURES.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join("");
  const faq = FAQ_ITEMS.map((f) => `<div><h3>${f.q}</h3><p>${f.a}</p></div>`).join("");
  return `<div id="seo-home" style="max-width:760px;margin:0 auto;padding:56px 24px;color:#e4e4e7;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;">
    <h1 style="font-size:2.25rem;font-weight:800;line-height:1.15;color:#fff;">Master Your Day, One Task at a Time</h1>
    <p style="color:#a1a1aa;font-size:1.05rem;margin-top:14px;">todo. is a free, beautifully designed task manager that turns everyday productivity into a game. Organize your to-do list, build daily streaks, earn XP, and stay ahead of your schedule — online or offline.</p>
    <p style="margin-top:20px;"><a href="/sign-up" style="color:#c084fc;font-weight:700;">Get started for free</a> &nbsp;&middot;&nbsp; <a href="/login" style="color:#c084fc;font-weight:700;">Sign in</a></p>
    <h2 style="font-size:1.5rem;font-weight:700;margin-top:44px;color:#fff;">Everything you need to stay organized</h2>
    <ul style="list-style:none;padding:0;margin-top:8px;">${features}</ul>
    <h2 style="font-size:1.5rem;font-weight:700;margin-top:44px;color:#fff;">Frequently asked questions</h2>
    ${faq}
    <nav style="margin-top:44px;color:#71717a;font-size:0.9rem;">
      <a href="/legal/privacy-policy" style="color:#71717a;">Privacy Policy</a> &middot;
      <a href="/legal/terms-and-conditions" style="color:#71717a;">Terms &amp; Conditions</a> &middot;
      <a href="/legal/cookie-policy" style="color:#71717a;">Cookie Policy</a> &middot;
      <a href="/legal/accessibility" style="color:#71717a;">Accessibility</a>
    </nav>
  </div>`;
}

// Homepage (dist/index.html): optimized meta + real, crawlable content.
// Written before the loop; the loop still uses the in-memory `template`.
let homeHtml = applyMeta(template, HOME_META, "");
homeHtml = homeHtml.replace(
  /<div id="root"[^>]*><\/div>/,
  `<div id="root" class="no-select">${buildHomeContent()}</div>`
);
fs.writeFileSync(templatePath, homeHtml, "utf-8");
console.log("✓ Pre-rendered homepage (/) with static SEO content");

// Remaining static routes (meta only — content is client-rendered).
for (const [route, meta] of Object.entries(routes)) {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  const html = applyMeta(template, meta, route);
  fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
  console.log(`✓ Pre-rendered static route: /${route}`);
}

console.log("SSG route generation completed successfully!");

// ── Service Worker Assets Injection & Cache Busting ──────────────────────────
console.log("Updating service worker cache manifest for robust offline support...");

const assetsDir = path.join(distDir, "assets");
let assets = [];
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  assets = files
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".ico"].includes(ext);
    })
    .map((f) => `/assets/${f}`);
}
console.log(`Found ${assets.length} compiled assets to cache.`);

const swPath = path.join(distDir, "sw.js");
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, "utf-8");

  // Format assets array as list strings
  const assetsString = assets.map((a) => `  '${a}',`).join("\n");

  // Replace SHELL_URLS list in sw.js
  swContent = swContent.replace(
    /const\s+SHELL_URLS\s*=\s*\[[\s\S]*?\];?/s,
    `const SHELL_URLS = [\n  '/',\n  '/index.html',\n  '/manifest.json',\n  '/list.png',\n${assetsString}\n];`
  );

  // Update SW_VERSION to force service worker updates in user browsers
  const buildHash = Date.now().toString();
  swContent = swContent.replace(
    /const\s+SW_VERSION\s*=\s*['"`]([^'"`]+)['"`];?/,
    `const SW_VERSION  = '$1-${buildHash}';`
  );

  fs.writeFileSync(swPath, swContent, "utf-8");
  console.log("✓ Successfully injected assets and cache-busted SW_VERSION in dist/sw.js");
} else {
  console.error("❌ sw.js not found in dist!");
}

