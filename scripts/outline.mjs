import fs from "node:fs";

const [, , nodeIdArg, maxDepthArg] = process.argv;
const MAX_DEPTH = Number(maxDepthArg ?? 6);
const f = JSON.parse(fs.readFileSync("design/figma/file.json", "utf8"));

const hex = (c) => {
  const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
  const a = c.a === undefined ? 1 : c.a;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase() + (a < 1 ? `/${Math.round(a * 100)}` : "");
};
const paint = (ps) =>
  (ps || [])
    .filter((p) => p.visible !== false)
    .map((p) => (p.type === "SOLID" ? hex(p.color) : p.type.startsWith("GRADIENT") ? p.type : p.type))
    .join(",");

const find = (n) => {
  if (n.id === nodeIdArg) return n;
  for (const c of n.children || []) {
    const r = find(c);
    if (r) return r;
  }
  return null;
};

const node = find(f.document);
if (!node) {
  console.error("node not found:", nodeIdArg);
  process.exit(1);
}

const lines = [];
const walk = (n, depth, x, y) => {
  const bb = n.absoluteBoundingBox || {};
  const pad = "  ".repeat(depth);
  const bits = [`${n.type} "${n.name}"`, `${Math.round(bb.width || 0)}x${Math.round(bb.height || 0)}`];
  if (n.type !== "TEXT") bits.push(`@${Math.round(bb.x || 0)},${Math.round(bb.y || 0)}`);
  const fill = paint(n.fills);
  if (fill) bits.push(`fill:${fill}`);
  const stroke = paint(n.strokes);
  if (stroke) bits.push(`stroke:${stroke}:${n.strokeWeight ?? 1}`);
  if (n.cornerRadius) bits.push(`r:${n.cornerRadius}`);
  if (n.layoutMode) bits.push(`${n.layoutMode} gap:${n.itemSpacing ?? 0} pad:${(n.paddingTop ?? 0) + "/" + (n.paddingRight ?? 0) + "/" + (n.paddingBottom ?? 0) + "/" + (n.paddingLeft ?? 0)}`);
  if (n.visible === false) bits.push("HIDDEN");
  lines.push(pad + bits.join(" "));
  if (n.type === "TEXT") {
    const s = n.style || {};
    lines.push(pad + `  text: ${JSON.stringify(n.characters)} | ${s.fontFamily} ${s.fontWeight} ${s.fontSize}px/${Math.round((s.lineHeightPx || 0) * 10) / 10} ls:${Math.round((s.letterSpacing || 0) * 100) / 100} align:${s.textAlignHorizontal}`);
  }
  if (depth >= MAX_DEPTH) {
    if ((n.children || []).length) lines.push(pad + `  … ${n.children.length} children`);
    return;
  }
  for (const c of n.children || []) walk(c, depth + 1, bb.x || 0, bb.y || 0);
};
walk(node, 0, 0, 0);
console.log(lines.join("\n"));
