import { test, after } from "node:test";
import assert from "node:assert/strict";
import { installTestDb } from "./testdb.ts";

const { client } = await installTestDb();
const { createCategory, listCategories, deleteCategory, ensureUncategorized, updateCategory } =
  await import("./categories.ts");
const { createTransaction, listTransactions } = await import("./transactions.ts");
after(() => client.close());

test("ensureUncategorized creates once and is idempotent", async () => {
  const a = await ensureUncategorized();
  const b = await ensureUncategorized();
  assert.equal(a, b);
  assert.equal((await listCategories()).filter((c) => c.name === "Uncategorized").length, 1);
});

test("updateCategory edits fields", async () => {
  const c = await createCategory({ name: "Tmp", color: null, emoji: null });
  const u = await updateCategory(c.id, { name: "Tmp2" });
  assert.equal(u?.name, "Tmp2");
});

test("deleteCategory reassigns transactions to Uncategorized", async () => {
  const cat = await createCategory({ name: "Travel", color: "#0ea5e9", emoji: "✈️" });
  const t1 = await createTransaction({ amountCents: 500, categoryId: cat.id, date: "2026-11-02" });
  const t2 = await createTransaction({ amountCents: 900, categoryId: cat.id, date: "2026-11-03" });

  await deleteCategory(cat.id);

  const uncat = await ensureUncategorized();
  assert.ok(!(await listCategories()).some((c) => c.id === cat.id));
  const all = await listTransactions();
  for (const t of [t1, t2]) {
    const found = all.find((x) => x.id === t.id);
    assert.ok(found, "transaction still exists");
    assert.equal(found.categoryId, uncat);
  }
});
