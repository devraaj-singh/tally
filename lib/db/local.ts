import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { categories } from "./schema.ts";
import { seedDemo } from "./seed-demo.ts";

/** Create (or open) the on-disk PGlite DB, apply the schema, seed if empty. */
export async function createLocalDb(dataDir = path.join(process.cwd(), ".pglite")) {
  const client = new PGlite(dataDir);
  // Apply every migration in filename order (all idempotent via IF NOT EXISTS).
  const dir = path.join(process.cwd(), "drizzle");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await client.exec(readFileSync(path.join(dir, f), "utf8"));
  }
  const db = drizzle(client);
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length === 0) await seedDemo(db);
  return db;
}
