import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

// 1. Unauthenticated visit to the clinic must bounce to /login
await page.goto(`${BASE}/patients`, { waitUntil: "networkidle" });
console.log("guard:", new URL(page.url()).pathname);

// 2. Create the clinician account (first run) or sign in (subsequent runs)
await page.goto(`${BASE}/login?mode=signup`, { waitUntil: "networkidle" });
await page.locator("#name").fill("Dr. Adika Nwosu");
await page.locator("#email").fill("adika.nwosu@harbour.health");
await page.locator("#password").fill("harbour-clinic-2026");
await page.getByRole("button", { name: /Create account/ }).click();
await page.waitForTimeout(2500);

if (new URL(page.url()).pathname !== "/") {
  console.log("signup did not land, trying sign-in");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator("#email").fill("adika.nwosu@harbour.health");
  await page.locator("#password").fill("harbour-clinic-2026");
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await page.waitForTimeout(2500);
}

console.log("after auth:", new URL(page.url()).pathname);
const heading = await page.locator("h1").first().textContent().catch(() => null);
console.log("dashboard heading:", heading?.trim().slice(0, 40) ?? "none");

// 3. Signed-in clinician reaches a record
await page.goto(`${BASE}/patients/zainab-bello`, { waitUntil: "networkidle" });
console.log("record:", new URL(page.url()).pathname, "|", (await page.locator("h1").first().textContent())?.trim());

console.log(errors.length ? `PAGE ERRORS: ${errors.join(" | ")}` : "no page errors");
await browser.close();
