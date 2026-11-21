import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { categories, transactions } from "./schema.ts";

const initSql = readFileSync(
  new URL("../../drizzle/0000_init.sql", import.meta.url),
  "utf8",
);

test("schema round-trips a category and a transaction with integer cents", async () => {
  const client = new PGlite();
  await client.exec(initSql);
  const db = drizzle(client);

  const [cat] = await db
    .insert(categories)
    .values({ name: "Food", color: "#f97316", emoji: "🍔" })
    .returning();
  assert.match(cat.id, /^[0-9a-f-]{36}$/);
  assert.equal(cat.name, "Food");
  assert.equal(cat.color, "#f97316");
  assert.equal(cat.emoji, "🍔");
  assert.ok(cat.createdAt instanceof Date);

  const [tx] = await db
    .insert(transactions)
    .values({ amountCents: 1299, categoryId: cat.id, note: "Lunch", date: "2026-11-20" })
    .returning();

  const [read] = await db.select().from(transactions).where(eq(transactions.id, tx.id));
  assert.equal(read.amountCents, 1299);
  assert.ok(Number.isInteger(read.amountCents));
  assert.equal(read.categoryId, cat.id);
  assert.equal(read.note, "Lunch");
  assert.equal(read.date, "2026-11-20");

  // FK is RESTRICT: deleting a category with transactions must fail
  await assert.rejects(() => db.delete(categories).where(eq(categories.id, cat.id)));

  await client.close();
});
