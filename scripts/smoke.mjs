import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

// 1. Acknowledge the first open alert and confirm the count drops.
await page.goto(`${BASE}/alerts`, { waitUntil: "networkidle" });
const before = await page.getByRole("button", { name: /^Acknowledge$/ }).count();
await page.getByRole("button", { name: /^Acknowledge$/ }).first().click();
await page.waitForTimeout(1500);
const after = await page.getByRole("button", { name: /^Acknowledge$/ }).count();
console.log(`alerts: acknowledge buttons ${before} -> ${after}`);

// 2. Register a patient through the dialog and land on the new record.
await page.goto(`${BASE}/patients`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Add patient/ }).click();
await page.locator("#name").fill("Test Adebimpe");
await page.locator("#age").fill("29");
await page.locator("#phone").fill("+234 80 1234 5678");
await page.getByRole("button", { name: /Register patient/ }).click();
await page.waitForURL(/\/patients\/test-adebimpe/, { timeout: 15000 });
console.log(`created: ${page.url()}`);

// 3. Log a severe reading and check the screening verdict appears.
await page.goto(`${BASE}/monitoring`, { waitUntil: "networkidle" });
const inputs = page.locator('input[name="systolic"]');
await inputs.last().fill("168");
await page.locator('input[name="diastolic"]').last().fill("112");
await page.getByRole("button", { name: /Check reading/ }).click();
await page.waitForTimeout(1500);
const verdict = await page.getByText(/severe range/i).first().textContent().catch(() => null);
console.log(`reading verdict: ${verdict?.trim().slice(0, 60) ?? "not shown"}`);

console.log(errors.length ? `PAGE ERRORS: ${errors.join(" | ")}` : "no page errors");
await browser.close();
