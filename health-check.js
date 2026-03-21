#!/usr/bin/env node
/**
 * FL Best Trainer — Pre-deployment Health Check
 * Run: node health-check.js
 * Run against prod: node health-check.js --url https://your-domain.com
 */

const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:3000";

const IS_PROD = BASE_URL.startsWith("https");

// Load .env.local for local checks
const envPath = path.join(__dirname, ".env.local");
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key) envVars[key] = val;
      }
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warned = 0;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function pass(label, detail = "") {
  passed++;
  console.log(`  ${green("✓")} ${label}${detail ? dim("  " + detail) : ""}`);
}

function fail(label, detail = "") {
  failed++;
  console.log(`  ${red("✗")} ${label}${detail ? `\n    ${red("→")} ${detail}` : ""}`);
}

function warn(label, detail = "") {
  warned++;
  console.log(`  ${yellow("⚠")} ${label}${detail ? dim("  " + detail) : ""}`);
}

function section(title) {
  console.log(`\n${bold(title)}`);
  console.log(dim("─".repeat(50)));
}

function getUrl(url, opts = {}) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http;
    const timeout = opts.timeout || 8000;
    const req = mod.get(url, { timeout }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on("error", (e) => resolve({ error: e.message }));
    req.on("timeout", () => { req.destroy(); resolve({ error: "timeout" }); });
  });
}

// ─── Checks ───────────────────────────────────────────────────────────────────

async function checkEnvVars() {
  section("1. Environment Variables");

  const required = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "GMAIL_USER",
    "GMAIL_PASS",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ];

  const recommended = [
    "CRON_SECRET",
    "STRIPE_WEBHOOK_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GDRIVE_CLIENT_EMAIL",
    "GDRIVE_PRIVATE_KEY",
    "GDRIVE_FOLDER_ID",
    "GSHEETS_SPREADSHEET_ID",
  ];

  for (const key of required) {
    const val = envVars[key] || process.env[key];
    if (!val) fail(`${key} is MISSING`, "Required — set this in .env.local / Vercel env");
    else pass(key, `set (${val.slice(0, 8)}...)`);
  }

  for (const key of recommended) {
    const val = envVars[key] || process.env[key];
    if (!val) warn(`${key} not set`, "Recommended for full functionality");
    else pass(key, "set");
  }
}

async function checkPages() {
  section("2. Page Routes");

  const pages = [
    { path: "/", name: "Home" },
    { path: "/classes", name: "Classes" },
    { path: "/training", name: "Training" },
    { path: "/about", name: "About" },
    { path: "/blog", name: "Blog" },
    { path: "/auth/signin", name: "Sign In" },
  ];

  for (const page of pages) {
    const url = `${BASE_URL}${page.path}`;
    const result = await getUrl(url);
    if (result.error) {
      fail(`${page.name} (${page.path})`, result.error);
    } else if (result.status === 200) {
      pass(`${page.name} (${page.path})`, `HTTP ${result.status}`);
    } else if (result.status === 302 || result.status === 301) {
      pass(`${page.name} (${page.path})`, `HTTP ${result.status} redirect`);
    } else {
      fail(`${page.name} (${page.path})`, `HTTP ${result.status}`);
    }
  }
}

async function checkApiRoutes() {
  section("3. API Routes");

  // Public / unauthenticated routes
  const publicRoutes = [
    { path: "/api/auth/session", name: "Auth session", okStatuses: [200] },
  ];

  // Routes that should reject unauthenticated (401/403/405) — confirms they exist & are responding
  const protectedRoutes = [
    { path: "/api/analytics", name: "Analytics API" },
    { path: "/api/bookings", name: "Bookings API (no params = 400 ok)" },
    { path: "/api/clients", name: "Clients API" },
    { path: "/api/admin/classes", name: "Admin classes API" },
  ];

  for (const route of publicRoutes) {
    const result = await getUrl(`${BASE_URL}${route.path}`);
    if (result.error) {
      fail(`${route.name} (${route.path})`, result.error);
    } else {
      pass(`${route.name} (${route.path})`, `HTTP ${result.status}`);
    }
  }

  for (const route of protectedRoutes) {
    const result = await getUrl(`${BASE_URL}${route.path}`);
    if (result.error) {
      fail(`${route.name} (${route.path})`, result.error);
    } else if ([200, 400, 401, 403, 405].includes(result.status)) {
      pass(`${route.name} (${route.path})`, `HTTP ${result.status} (responding)`);
    } else if (result.status === 500) {
      fail(`${route.name} (${route.path})`, `HTTP 500 — server error`);
    } else {
      warn(`${route.name} (${route.path})`, `HTTP ${result.status}`);
    }
  }
}

async function checkStaticAssets() {
  section("4. Static Assets");

  const assets = [
    { path: "/favicon.ico", name: "Favicon" },
    { path: "/manifest.json", name: "PWA Manifest" },
    { path: "/robots.txt", name: "robots.txt" },
  ];

  for (const asset of assets) {
    const result = await getUrl(`${BASE_URL}${asset.path}`);
    if (result.error) {
      warn(`${asset.name} (${asset.path})`, result.error);
    } else if (result.status === 200) {
      pass(`${asset.name} (${asset.path})`);
    } else if (result.status === 404) {
      warn(`${asset.name} (${asset.path})`, "Not found (not critical)");
    } else {
      warn(`${asset.name} (${asset.path})`, `HTTP ${result.status}`);
    }
  }
}

async function checkCronEndpoints() {
  section("5. Cron Endpoints (auth check)");

  const crons = [
    { path: "/api/cron/daily-class-summary", name: "Daily summary" },
    { path: "/api/cron/weekly-class-report", name: "Weekly report" },
    { path: "/api/cron/monthly-report", name: "Monthly report" },
  ];

  for (const cron of crons) {
    const result = await getUrl(`${BASE_URL}${cron.path}`);
    if (result.error) {
      fail(`${cron.name}`, result.error);
    } else if (result.status === 401) {
      pass(`${cron.name}`, "HTTP 401 — auth guard working ✓");
    } else if (result.status === 200) {
      warn(`${cron.name}`, "HTTP 200 without auth — CRON_SECRET may not be set");
    } else if (result.status === 405) {
      pass(`${cron.name}`, "HTTP 405 — endpoint exists");
    } else {
      warn(`${cron.name}`, `HTTP ${result.status}`);
    }
  }
}

async function checkVercelConfig() {
  section("6. vercel.json / Config");

  const vercelPath = path.join(__dirname, "vercel.json");
  if (!fs.existsSync(vercelPath)) {
    fail("vercel.json not found");
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
      pass("vercel.json is valid JSON");

      const crons = config.crons || [];
      pass(`Cron jobs configured: ${crons.length}`, crons.map((c) => c.path.split("/").pop()).join(", "));

      if (crons.length === 0) warn("No cron jobs defined");
    } catch {
      fail("vercel.json is invalid JSON");
    }
  }

  const nextConfigPath = path.join(__dirname, "next.config.js");
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, "utf8");
    if (content.includes("ignoreBuildErrors: true")) {
      warn("next.config.js has typescript.ignoreBuildErrors: true", "TypeScript errors won't fail the build");
    } else {
      pass("TypeScript build errors not suppressed");
    }
  }
}

async function checkDatabaseUrl() {
  section("7. Database Connection String");

  const dbUrl = envVars["DATABASE_URL"] || process.env.DATABASE_URL;
  if (!dbUrl) {
    fail("DATABASE_URL not set — cannot validate");
    return;
  }

  try {
    const url = new URL(dbUrl);
    if (url.hostname.includes("neon.tech") || url.hostname.includes("neon.database")) {
      pass("DATABASE_URL", "Neon PostgreSQL detected");
    } else {
      pass("DATABASE_URL", `Host: ${url.hostname}`);
    }

    if (!url.password) warn("DATABASE_URL has no password");
    if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
      fail("DATABASE_URL protocol unexpected", url.protocol);
    }
  } catch {
    fail("DATABASE_URL is not a valid URL");
  }
}

async function checkBuildFiles() {
  section("8. Project Files");

  const checks = [
    { file: "package.json", name: "package.json" },
    { file: "next.config.js", name: "next.config.js" },
    { file: "tailwind.config.js", name: "tailwind.config.js" },
    { file: "tsconfig.json", name: "tsconfig.json" },
    { file: "pages/index.tsx", name: "Home page" },
    { file: "pages/api/analytics.ts", name: "Analytics API" },
    { file: "lib/database.ts", name: "Database lib" },
    { file: "components/admin/AnalyticsTabsNew.tsx", name: "Analytics component" },
    { file: "components/admin/analytics/types.ts", name: "Analytics types" },
    { file: "pages/api/cron/monthly-report.ts", name: "Monthly report cron" },
  ];

  for (const check of checks) {
    const full = path.join(__dirname, check.file);
    if (fs.existsSync(full)) {
      const size = fs.statSync(full).size;
      pass(check.name, `${(size / 1024).toFixed(1)} KB`);
    } else {
      fail(check.name, `Missing: ${check.file}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(bold("\n╔════════════════════════════════════════════════╗"));
  console.log(bold("║   FL Best Trainer — Pre-deployment Health Check  ║"));
  console.log(bold("╚════════════════════════════════════════════════╝"));
  console.log(`\n  Target: ${bold(BASE_URL)}`);
  console.log(dim(`  Run with --url https://yourdomain.com to check production\n`));

  const isServerRunning = await getUrl(`${BASE_URL}/api/auth/session`);
  if (isServerRunning.error && isServerRunning.error !== "timeout") {
    if (!IS_PROD) {
      console.log(
        yellow(`\n  ⚠ Server not reachable at ${BASE_URL}`) +
          "\n  " +
          dim("Some checks will be skipped. Run `npm run dev` first for full results.\n"),
      );
    }
  }

  await checkEnvVars();
  await checkBuildFiles();
  await checkVercelConfig();
  await checkDatabaseUrl();
  await checkPages();
  await checkApiRoutes();
  await checkStaticAssets();
  await checkCronEndpoints();

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passed + failed + warned;
  console.log(`\n${bold("═".repeat(52))}`);
  console.log(bold("  RESULTS"));
  console.log(bold("═".repeat(52)));
  console.log(`  ${green("✓ Passed: " + passed.toString().padEnd(4))} ${yellow("⚠ Warnings: " + warned.toString().padEnd(4))} ${red("✗ Failed: " + failed)}`);
  console.log(bold("═".repeat(52)));

  if (failed === 0 && warned === 0) {
    console.log(`\n  ${green("🎉 All checks passed — looks good to deploy!")}\n`);
  } else if (failed === 0) {
    console.log(`\n  ${yellow("⚠  No failures, but review warnings above before deploying.")}\n`);
  } else {
    console.log(`\n  ${red("✗  Fix the failed checks before deploying.")}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(red("\nHealth check crashed: " + e.message));
  process.exit(1);
});
