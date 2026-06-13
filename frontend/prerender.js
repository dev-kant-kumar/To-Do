import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    description: "Manage your tasks, filter by Starred, Today, or Deleted, and track your daily lists on todo.."
  },
  "profile": {
    title: "Settings | todo.",
    description: "Update your personal information, manage security, and configure your todo. profile."
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

for (const [route, meta] of Object.entries(routes)) {
  const routeDir = path.join(distDir, route);
  
  // Create physical directory for route
  fs.mkdirSync(routeDir, { recursive: true });
  
  // Custom SEO Tags replacement in index.html
  let html = template;
  
  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
  
  // Replace Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
    `<meta name="description" content="${meta.description}" />`
  );
  
  // Replace Open Graph Tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
    `<meta property="og:url" content="https://todo.devkantkumar.com/${route}" />`
  );
  
  // Replace Twitter Tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/,
    `<meta name="twitter:description" content="${meta.description}" />`
  );
  
  // Replace Canonical Link
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
    `<link rel="canonical" href="https://todo.devkantkumar.com/${route}" />`
  );

  // Write static index.html file to folder
  fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
  console.log(`✓ Pre-rendered static route: /${route}`);
}

console.log("SSG route generation completed successfully!");
