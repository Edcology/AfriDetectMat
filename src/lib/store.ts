import { connection } from "next/server";
import { loadDb, nextPatientId, slugify } from "@/db/repo";

export type { Db } from "@/db/repo";
export { nextPatientId, slugify };

/**
 * Live workspace read. Kept as a single seam so pages never talk to the
 * database directly — swapping Postgres for a cached/read-replica layer later
 * only changes this file.
 */
export async function getDb() {
  await connection();
  return loadDb();
}
