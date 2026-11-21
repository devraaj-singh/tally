import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema.ts";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const g = globalThis as unknown as { __tallyDb?: Promise<Db> };

/** Neon HTTP when DATABASE_URL is set, otherwise local PGlite in .pglite/. */
export function getDb(): Promise<Db> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("getDb() must not be called during next build");
  }
  if (!g.__tallyDb) {
    g.__tallyDb = (async () => {
      if (process.env.DATABASE_URL) {
        return drizzleNeon(neon(process.env.DATABASE_URL), { schema }) as unknown as Db;
      }
      const { createLocalDb } = await import("./local.ts");
      return (await createLocalDb()) as unknown as Db;
    })();
  }
  return g.__tallyDb;
}
