import fs from "node:fs";

for (const file of ["src/lib/data.ts", "src/lib/mother-data.ts"]) {
  const source = fs.readFileSync(file, "utf8");
  const patched = source.replace(/from "@\/lib\//g, 'from "./');
  if (patched !== source) {
    fs.writeFileSync(file, patched, "utf8");
    console.log("rewired imports in", file);
  }
}
