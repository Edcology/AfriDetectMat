/**
 * Applies every .sql file in ./drizzle in order.
 *
 *   DATABASE_URL=postgres://... node scripts/db-migrate.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const dir = path.resolve("drizzle");
const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
const sql = postgres(url, { max: 1 });

for (const file of files) {
  const statements = await readFile(path.join(dir, file), "utf8");
  await sql.unsafe(statements);
  console.log(`applied ${file}`);
}

await sql.end();
console.log("database up to date");
