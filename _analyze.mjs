import fs from "node:fs";
const f = JSON.parse(fs.readFileSync("design/figma/file.json","utf8"));
const colors = new Map(), fonts = new Map(), radii = new Map();
const add = (m,k)=>m.set(k,(m.get(k)||0)+1);
const hex = c => {
  const r=Math.round(c.r*255),g=Math.round(c.g*255),b=Math.round(c.b*255);
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase()+(c.a!==undefined&&c.a<1?` @${Math.round(c.a*100)}%`:"");
};
const walk = n => {
  for (const p of n.fills||[]) if (p.type==="SOLID" && p.visible!==false) add(colors, hex(p.color));
  for (const p of n.strokes||[]) if (p.type==="SOLID" && p.visible!==false) add(colors, "stroke "+hex(p.color));
  if (n.cornerRadius) add(radii, n.cornerRadius);
  if (n.type==="TEXT" && n.style) {
    const s=n.style;
    const key = `${s.fontFamily} ${s.fontWeight} ${s.fontSize}px/${Math.round((s.lineHeightPx||0)*10)/10} ls:${Math.round((s.letterSpacing||0)*100)/100}`;
    add(fonts,key);
  }
  (n.children||[]).forEach(walk);
};
walk(f.document);
const top = m => [...m.entries()].sort((a,b)=>b[1]-a[1]);
console.log("--- FILL COLORS ---");
top(colors).slice(0,45).forEach(([k,v])=>console.log(`${String(v).padStart(5)}  ${k}`));
console.log("\n--- TYPOGRAPHY ---");
top(fonts).slice(0,30).forEach(([k,v])=>console.log(`${String(v).padStart(5)}  ${k}`));
console.log("\n--- RADII ---");
top(radii).slice(0,15).forEach(([k,v])=>console.log(`${String(v).padStart(5)}  ${k}`));
