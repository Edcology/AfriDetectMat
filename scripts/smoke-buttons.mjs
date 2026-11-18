import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.locator("#email").fill("adika.nwosu@harbour.health");
await page.locator("#password").fill("harbour-clinic-2026");
await page.getByRole("button", { name: /^Sign in$/ }).first().click();
await page.waitForTimeout(3000);

await page.goto(`${BASE}/appointments?month=2026-12`, { waitUntil: "networkidle" });
console.log("calendar month:", (await page.getByText("December 2026").first().textContent())?.trim());

await page.goto(`${BASE}/screening?protocol=glucose`, { waitUntil: "networkidle" });
console.log("protocol switch:", (await page.getByRole("link", { name: /Switch to hypertension/ }).textContent())?.trim());

await page.goto(`${BASE}/mother`, { waitUntil: "networkidle" });
const listen = page.getByRole("button", { name: /read this card aloud/ }).first();
await listen.click();
await page.waitForTimeout(600);
console.log("listen pressed:", await page.getByRole("button", { name: /Stop reading/ }).first().getAttribute("aria-pressed"));
await page.getByRole("button", { name: /Stop reading/ }).first().click();

await page.goto(`${BASE}/mother/notifications`, { waitUntil: "networkidle" });
console.log("mark all read:", await page.getByRole("button", { name: /Mark all read/ }).count());

await page.goto(`${BASE}/mother/records?tab=documents`, { waitUntil: "networkidle" });
console.log("download href:", await page.getByRole("link", { name: /Download/ }).first().getAttribute("href"));

await page.goto(`${BASE}/mother/messages`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /New message/ }).click();
await page.waitForTimeout(400);
console.log("composer focused:", await page.evaluate(() => document.activeElement?.id));

const res = await page.request.get(`${BASE}/api/mother/record?doc=Booking%20summary`);
console.log("summary endpoint:", res.status(), (await res.text()).split("\n")[0]);

await browser.close();
