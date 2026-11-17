import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

// 1. Mother check-in with a concerning symptom should reach the clinic alerts.
await page.goto(`${BASE}/alerts`, { waitUntil: "networkidle" });
const alertsBefore = await page.getByRole("button", { name: /^Acknowledge$/ }).count();

await page.goto(`${BASE}/mother/check-in`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Headache/ }).click();
await page.getByRole("button", { name: /Swollen feet or ankles/ }).click();
await page.locator("#note").fill("Headache since last night and my feet are puffy.");
await page.getByRole("button", { name: /Send check-in/ }).click();
await page.waitForTimeout(1800);
const confirmed = await page.getByText(/care team has been alerted/i).isVisible().catch(() => false);
console.log(`check-in sent: ${confirmed}`);

await page.goto(`${BASE}/alerts`, { waitUntil: "networkidle" });
const alertsAfter = await page.getByRole("button", { name: /^Acknowledge$/ }).count();
console.log(`clinic alerts awaiting ack: ${alertsBefore} -> ${alertsAfter}`);
const flagged = await page.getByText(/Check-in flagged/i).first().textContent().catch(() => null);
console.log(`alert title: ${flagged?.trim() ?? "not found"}`);

// 2. Mother sends a message.
await page.goto(`${BASE}/mother/messages`, { waitUntil: "networkidle" });
await page.getByLabel("Write a message").fill("Thank you, see you Thursday.");
await page.getByRole("button", { name: /^Send$/ }).click();
await page.waitForTimeout(1200);
const sent = await page.getByText("Thank you, see you Thursday.").first().isVisible().catch(() => false);
console.log(`message posted: ${sent}`);

// 3. Profile setup saves.
await page.goto(`${BASE}/mother/profile?setup=1`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Set up my profile/ }).click();
await page.waitForTimeout(1500);
const saved = await page.getByText(/saved and linked/i).first().isVisible().catch(() => false);
console.log(`profile saved: ${saved}`);

console.log(errors.length ? `PAGE ERRORS: ${errors.join(" | ")}` : "no page errors");
await browser.close();
