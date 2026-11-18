import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

// clinician signed in
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#email").fill("adika.nwosu@harbour.health");
await page.locator("#password").fill("harbour-clinic-2026");
await page.getByRole("button", { name: /^Sign in$/ }).first().click();
await page.waitForTimeout(2500);

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const msgIcon = page.getByRole("link", { name: "Messages" }).first();
console.log("clinic message icon href:", await msgIcon.getAttribute("href"));

await page.goto(`${BASE}/messages`, { waitUntil: "networkidle" });
console.log("clinic inbox:", new URL(page.url()).pathname, "|", (await page.locator("h1").first().textContent())?.trim());

// mother app
await page.goto(`${BASE}/mother`, { waitUntil: "networkidle" });
const bell = page.getByRole("link", { name: "Notifications" }).first();
console.log("mother bell href:", await bell.getAttribute("href"));

const before = await page.evaluate(() => getComputedStyle(document.querySelector("main")).zoom);
await page.getByRole("button", { name: /Text size/ }).click();
await page.waitForTimeout(400);
const after = await page.evaluate(() => getComputedStyle(document.querySelector("main")).zoom);
console.log("text size zoom:", before, "->", after);

const readBtn = page.getByRole("button", { name: /Read this page aloud/ });
await readBtn.click();
await page.waitForTimeout(1200);
const pressed = await page.getByRole("button", { name: /Stop reading aloud/ }).getAttribute("aria-pressed");
console.log("read aloud pressed:", pressed);
await page.getByRole("button", { name: /Stop reading aloud/ }).click();

await page.goto(`${BASE}/mother/notifications`, { waitUntil: "networkidle" });
console.log("mother notifications:", new URL(page.url()).pathname, "|", (await page.locator("h1").first().textContent())?.trim());

await browser.close();
