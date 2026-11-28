import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../db/schema.ts";

/** Installs an in-memory PGlite as the getDb() singleton (test use only). */
export async function installTestDb() {
  const client = new PGlite();
  const dir = new URL("../../drizzle/", import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await client.exec(readFileSync(new URL(f, dir), "utf8"));
  }
  const db = drizzle(client, { schema });
  (globalThis as unknown as { __tallyDb?: Promise<unknown> }).__tallyDb = Promise.resolve(db);
  return { db, client };
}
