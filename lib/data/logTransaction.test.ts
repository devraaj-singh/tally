import { test, after } from "node:test";
import assert from "node:assert/strict";
import { installTestDb } from "./testdb.ts";

const { client } = await installTestDb();
const { createCategory, listCategories } = await import("./categories.ts");
const { listTransactions } = await import("./transactions.ts");
const { logTransaction } = await import("./logTransaction.ts");

after(() => client.close());

const today = () => new Date().toISOString().slice(0, 10);

test("invalid amounts return an error and insert nothing", async () => {
  for (const amount of ["0", "abc", ""]) {
    const res = await logTransaction({ amount, categoryName: "Food" });
    assert.ok("error" in res, `expected error for "${amount}"`);
  }
  assert.equal((await listTransactions()).length, 0);
  assert.equal((await listCategories()).length, 0);
});

test("empty category name returns an error", async () => {
  const res = await logTransaction({ amount: "5", categoryName: "   " });
  assert.ok("error" in res);
  assert.equal((await listTransactions()).length, 0);
});

test("new category is created and one transaction inserted with today's date", async () => {
  const res = await logTransaction({ amount: "12.34", categoryName: "Coffee", note: "latte" });
  assert.deepEqual(res, { ok: true });
  const cats = await listCategories();
  assert.equal(cats.length, 1);
  assert.equal(cats[0].name, "Coffee");
  const txs = await listTransactions();
  assert.equal(txs.length, 1);
  assert.equal(txs[0].amountCents, 1234);
  assert.equal(txs[0].date, today());
  assert.equal(txs[0].note, "latte");
  assert.equal(txs[0].categoryId, cats[0].id);
});

test("existing category matched case-insensitively and trimmed, no duplicate", async () => {
  const food = await createCategory({ name: "Food" });
  const res = await logTransaction({ amount: "3", categoryName: " food ", date: "2026-01-02" });
  assert.deepEqual(res, { ok: true });
  const foods = (await listCategories()).filter((c) => c.name.toLowerCase() === "food");
  assert.equal(foods.length, 1);
  const txs = await listTransactions({ categoryId: food.id });
  assert.equal(txs.length, 1);
  assert.equal(txs[0].date, "2026-01-02");
});
