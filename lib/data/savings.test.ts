import { test, after } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { installTestDb } from "./testdb.ts";

const { db, client } = await installTestDb();
const { createGoal, updateGoal, listGoals, archiveGoal, addContribution, listContributions } =
  await import("./savings.ts");
const { savingsGoals, savingsContributions } = await import("../db/schema.ts");
after(() => client.close());

test("listGoals sums contributions and computes pct", async () => {
  const g = await createGoal({ name: "Trip", targetCents: 100000, emoji: "✈️" });
  await addContribution({ goalId: g.id, amountCents: 20000, date: "2026-11-01" });
  await addContribution({ goalId: g.id, amountCents: 5000, date: "2026-11-05", note: "bonus" });
  const found = (await listGoals()).find((x) => x.id === g.id)!;
  assert.equal(found.savedCents, 25000);
  assert.equal(found.pct, 0.25);
  const contribs = await listContributions(g.id);
  assert.deepEqual(contribs.map((c) => c.amountCents), [5000, 20000]); // newest first
});

test("goal with no contributions has savedCents 0", async () => {
  const g = await createGoal({ name: "Empty", targetCents: 500 });
  const found = (await listGoals()).find((x) => x.id === g.id)!;
  assert.equal(found.savedCents, 0);
  assert.equal(found.pct, 0);
});

test("pct guards divide-by-zero when target is 0", async () => {
  const [g] = await db.insert(savingsGoals).values({ name: "Zero", targetCents: 0 }).returning();
  await addContribution({ goalId: g.id, amountCents: 100 });
  const found = (await listGoals()).find((x) => x.id === g.id)!;
  assert.equal(found.pct, 0);
  assert.equal(found.savedCents, 100);
});

test("addContribution defaults date to today", async () => {
  const g = await createGoal({ name: "Today", targetCents: 1000 });
  const c = await addContribution({ goalId: g.id, amountCents: 100 });
  assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("archiveGoal hides goal from listGoals but keeps contributions", async () => {
  const g = await createGoal({ name: "Old", targetCents: 1000 });
  await addContribution({ goalId: g.id, amountCents: 300 });
  await archiveGoal(g.id);
  assert.equal((await listGoals()).some((x) => x.id === g.id), false);
  assert.equal((await listContributions(g.id)).length, 1);
});

test("deleting a goal cascades its contributions", async () => {
  const g = await createGoal({ name: "Gone", targetCents: 1000 });
  await addContribution({ goalId: g.id, amountCents: 300 });
  await db.delete(savingsGoals).where(eq(savingsGoals.id, g.id));
  const rows = await db.select().from(savingsContributions).where(eq(savingsContributions.goalId, g.id));
  assert.equal(rows.length, 0);
});

test("updateGoal edits fields", async () => {
  const g = await createGoal({ name: "A", targetCents: 1000 });
  const u = await updateGoal(g.id, { name: "B", targetCents: 2000 });
  assert.equal(u.name, "B");
  assert.equal(u.targetCents, 2000);
});

test("cents are validated as positive integers", async () => {
  const g = await createGoal({ name: "V", targetCents: 1000 });
  for (const bad of [0, -5, 1.5, NaN]) {
    await assert.rejects(createGoal({ name: "x", targetCents: bad }), /positive integer/);
    await assert.rejects(addContribution({ goalId: g.id, amountCents: bad }), /positive integer/);
    await assert.rejects(updateGoal(g.id, { targetCents: bad }), /positive integer/);
  }
});
