// Applies every drizzle/*.sql (filename order) to the database in DATABASE_URL.
// Idempotent: all migrations use IF NOT EXISTS.
// Usage: DATABASE_URL=... npm run db:migrate
//   or:  node --env-file=.env.local scripts/migrate.mjs
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("db:migrate failed: DATABASE_URL is not set.");
  process.exit(1);
}

const dir = new URL("../drizzle/", import.meta.url);
const pool = new Pool({ connectionString: url });

try {
  const files = (await readdir(fileURLToPath(dir))).filter((f) => f.endsWith(".sql")).sort();
  if (files.length === 0) throw new Error("no drizzle/*.sql migrations found");
  for (const file of files) {
    const sql = await readFile(new URL(file, dir), "utf8");
    // Multi-statement script: single connection, one transaction per file.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log(`db:migrate OK: applied drizzle/${file}`);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw new Error(`drizzle/${file}: ${err instanceof Error ? err.message : err}`);
    } finally {
      client.release();
    }
  }
} catch (err) {
  console.error("db:migrate failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
