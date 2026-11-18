import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

// Reproduce the reported path: arrive on signup, then client-navigate to sign in.
await page.goto(`${BASE}/login?mode=signup`, { waitUntil: "networkidle" });
await page.getByRole("link", { name: /^Sign in$/ }).click();
await page.waitForTimeout(800);
console.log("on:", new URL(page.url()).pathname + new URL(page.url()).search);

// Submit empty password — should complain about the password, not "Fill in every field."
await page.locator("#email").fill("adika.nwosu@harbour.health");
await page.getByRole("button", { name: /^Sign in$/ }).first().click();
await page.waitForTimeout(1200);
const emptyError = await page.locator("form p.text-danger").first().textContent().catch(() => null);
console.log("empty password ->", emptyError?.trim() ?? "no error shown");

// Then a real sign in.
await page.locator("#password").fill("harbour-clinic-2026");
await page.getByRole("button", { name: /^Sign in$/ }).first().click();
await page.waitForTimeout(2500);
console.log("signed in ->", new URL(page.url()).pathname);
console.log("heading:", (await page.locator("h1").first().textContent())?.trim().slice(0, 32) ?? "none");
await browser.close();
