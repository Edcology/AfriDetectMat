import { chromium } from "playwright";

const BASE = "https://afridetectmat-npm2wfw2j-edcologys-projects.vercel.app";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

// 1. Anonymous access is refused
const guard = await page.goto(`${BASE}/patients`, { waitUntil: "networkidle" });
console.log("anonymous /patients:", new URL(page.url()).pathname, guard?.status());

const motherGuard = await page.goto(`${BASE}/mother`, { waitUntil: "networkidle" });
console.log("anonymous /mother:", new URL(page.url()).pathname);

const api = await page.request.get(`${BASE}/api/mother/record?doc=x`);
console.log("anonymous download:", api.status());

// 2. Sign in for real, over HTTPS
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#email").fill("adika.nwosu@harbour.health");
await page.locator("#password").fill("harbour-clinic-2026");
await page.getByRole("button", { name: /^Sign in$/ }).first().click();
await page.waitForTimeout(4000);
console.log("after sign-in:", new URL(page.url()).pathname);
console.log("heading:", (await page.locator("h1").first().textContent().catch(() => null))?.trim().slice(0, 36) ?? "none");

// 3. A record and the mother app behind the gate
await page.goto(`${BASE}/patients/zainab-bello`, { waitUntil: "networkidle" });
console.log("record:", new URL(page.url()).pathname, "|", (await page.locator("h1").first().textContent())?.trim());

await page.goto(`${BASE}/mother`, { waitUntil: "networkidle" });
console.log("mother app:", new URL(page.url()).pathname, "|", (await page.locator("h1").first().textContent())?.trim().slice(0, 30));

const dl = await page.request.get(`${BASE}/api/mother/record?doc=Booking%20summary`);
console.log("download as clinician:", dl.status(), (await dl.text()).split("\n")[0]?.slice(0, 30));

console.log(errors.length ? `PAGE ERRORS: ${errors.join(" | ").slice(0, 200)}` : "no page errors");
await browser.close();
