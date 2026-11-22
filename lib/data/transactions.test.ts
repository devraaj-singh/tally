import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { installTestDb } from "./testdb.ts";

const { client } = await installTestDb();
const { createCategory } = await import("./categories.ts");
const {
  createTransaction, listTransactions, monthlyTotalCents, breakdownByCategory,
  updateTransaction, deleteTransaction,
} = await import("./transactions.ts");

let food: { id: string };
let fun: { id: string };

before(async () => {
  food = await createCategory({ name: "Food", color: "#f97316", emoji: "🍔" });
  fun = await createCategory({ name: "Fun", color: "#8b5cf6", emoji: "🎮" });
  await createTransaction({ amountCents: 1000, categoryId: food.id, date: "2026-10-01" });
  await createTransaction({ amountCents: 250, categoryId: food.id, date: "2026-10-31" });
  await createTransaction({ amountCents: 700, categoryId: fun.id, date: "2026-11-01" });
  await createTransaction({ amountCents: 300, categoryId: fun.id, date: "2026-09-30" });
});
after(() => client.close());

test("monthlyTotalCents includes first and last day, excludes neighbours", async () => {
  assert.equal(await monthlyTotalCents("2026-10"), 1250);
  assert.equal(await monthlyTotalCents("2026-11"), 700);
  assert.equal(await monthlyTotalCents("2026-09"), 300);
  assert.equal(await monthlyTotalCents("2026-08"), 0);
});

test("breakdownByCategory sums per category for the month", async () => {
  const oct = await breakdownByCategory("2026-10");
  assert.equal(oct.length, 1);
  assert.deepEqual(oct[0], {
    categoryId: food.id, name: "Food", color: "#f97316", emoji: "🍔", totalCents: 1250,
  });
  const nov = await breakdownByCategory("2026-11");
  assert.equal(nov.length, 1);
  assert.equal(nov[0].name, "Fun");
  assert.equal(nov[0].totalCents, 700);
});

test("listTransactions filters by month and category; update/delete work", async () => {
  const oct = await listTransactions({ month: "2026-10" });
  assert.equal(oct.length, 2);
  assert.equal((await listTransactions({ categoryId: fun.id })).length, 2);
  assert.equal((await listTransactions({ month: "2026-10", categoryId: fun.id })).length, 0);
  assert.equal((await listTransactions()).length, 4);

  const t = oct[0];
  const upd = await updateTransaction(t.id, { amountCents: 1 });
  assert.equal(upd?.amountCents, 1);
  await deleteTransaction(t.id);
  assert.equal((await listTransactions({ month: "2026-10" })).length, 1);
});
