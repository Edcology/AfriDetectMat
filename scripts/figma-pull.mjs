#!/usr/bin/env node
/**
 * Pulls the "Mom" Figma file into design/figma/ for local reference.
 *
 *   set FIGMA_TOKEN=figd_xxx
 *   node scripts/figma-pull.mjs
 *
 * Outputs:
 *   design/figma/file.json        full document tree (what we code against)
 *   design/figma/frames.txt       flat list of top-level frames: id, name, size
 *   design/figma/png/<id>.png     rendered PNGs at 2x for visual diffing
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const FILE_KEY = process.env.FIGMA_FILE_KEY || "qxXAbwvYaxUa293k7YxKnf";
const TOKEN = process.env.FIGMA_TOKEN;
const OUT = path.resolve("design/figma");

if (!TOKEN) {
  console.error("Missing FIGMA_TOKEN. Create one at figma.com/settings (read-only file access).");
  process.exit(1);
}

const api = async (p) => {
  const res = await fetch(`https://api.figma.com/v1${p}`, { headers: { "X-Figma-Token": TOKEN } });
  if (!res.ok) throw new Error(`${p} -> ${res.status} ${await res.text()}`);
  return res.json();
};

const file = await api(`/files/${FILE_KEY}`);
await mkdir(path.join(OUT, "png"), { recursive: true });
await writeFile(path.join(OUT, "file.json"), JSON.stringify(file, null, 2));

// Flatten to top-level frames (direct children of each page, plus one level down).
const rows = [];
const walk = (node, depth = 0) => {
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "SECTION") {
    rows.push({
      id: node.id,
      name: node.name,
      type: node.type,
      w: node.absoluteBoundingBox?.width ?? null,
      h: node.absoluteBoundingBox?.height ?? null,
      depth,
    });
  }
  if (depth < 2) (node.children || []).forEach((c) => walk(c, depth + 1));
};
for (const page of file.document.children) walk(page, 0);

await writeFile(
  path.join(OUT, "frames.txt"),
  rows.map((r) => `${r.id}\t${r.name}\t${Math.round(r.w ?? 0)}x${Math.round(r.h ?? 0)}`).join("\n")
);
console.log(`document: ${file.name}`);
console.log(`frames:   ${rows.length} -> design/figma/frames.txt`);
console.log(rows.map((r) => `  ${r.id}  ${r.name}  ${Math.round(r.w)}x${Math.round(r.h)}`).join("\n"));

// Render the biggest frames to PNG at 2x (Figma caps at 32 ids per call).
const shots = rows.filter((r) => (r.w ?? 0) > 200 && r.type === "FRAME").slice(0, 96);
for (let i = 0; i < shots.length; i += 24) {
  const batch = shots.slice(i, i + 24);
  const ids = batch.map((r) => r.id).join(",");
  const { images } = await api(`/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`);
  for (const [id, url] of Object.entries(images)) {
    if (!url) continue;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(path.join(OUT, "png", `${id.replace(/[:]/g, "-")}.png`), buf);
  }
  console.log(`rendered ${Math.min(i + 24, shots.length)}/${shots.length}`);
}
console.log("done");
