import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __afridetectSql: ReturnType<typeof postgres> | undefined;
}

export function hasDatabase() {
  return Boolean(connectionString);
}

function client() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env.local (see README)."
    );
  }
  if (!globalThis.__afridetectSql) {
    globalThis.__afridetectSql = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      prepare: false,
    });
  }
  return globalThis.__afridetectSql;
}

export function db() {
  return drizzle(client(), { schema });
}

export { schema };
