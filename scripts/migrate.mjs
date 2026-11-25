// Applies drizzle/0000_init.sql to the database in DATABASE_URL (idempotent).
// Usage: DATABASE_URL=... npm run db:migrate
//   or:  node --env-file=.env.local scripts/migrate.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("db:migrate failed: DATABASE_URL is not set.");
  process.exit(1);
}

const sqlPath = fileURLToPath(new URL("../drizzle/0000_init.sql", import.meta.url));
const pool = new Pool({ connectionString: url });

try {
  const sql = await readFile(sqlPath, "utf8");
  // Multi-statement script: run on a single connection in one transaction.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  console.log("db:migrate OK: applied drizzle/0000_init.sql");
} catch (err) {
  console.error("db:migrate failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
