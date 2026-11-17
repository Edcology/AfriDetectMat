import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:3000";
const routes = [
  ["overview", "/"],
  ["patients", "/patients"],
  ["patient", "/patients/zainab-bello"],
  ["appointments", "/appointments"],
  ["monitoring", "/monitoring"],
  ["alerts", "/alerts"],
  ["screening", "/screening"],
  ["referrals", "/referrals"],
  ["reports", "/reports"],
  ["mother-access", "/mother-access"],
  ["facility-admin", "/facility-admin"],
  ["notifications", "/notifications"],
  ["profile", "/profile"],
  ["help", "/help"],
  ["m-home", "/mother"],
  ["m-checkin", "/mother/check-in"],
  ["m-appointments", "/mother/appointments"],
  ["m-messages", "/mother/messages"],
  ["m-records", "/mother/records"],
  ["m-learn", "/mother/learn"],
  ["m-lesson", "/mother/learn/why-antenatal-visits-matter"],
  ["m-profile", "/mother/profile"],
];

const out = "design/shots";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });

for (const [name, path] of routes) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  console.log(`${name.padEnd(14)} ${errors.length ? "ERRORS: " + errors.join(" | ") : "ok"}`);
}

await browser.close();
