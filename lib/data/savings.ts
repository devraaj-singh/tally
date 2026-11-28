import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { savingsContributions, savingsGoals } from "../db/schema.ts";
import type { SavingsContribution, SavingsGoal } from "../db/schema.ts";

export type GoalInput = {
  name: string;
  targetCents: number;
  emoji?: string | null;
  color?: string | null;
};
export type GoalWithProgress = SavingsGoal & { savedCents: number; pct: number };
export type ContributionInput = {
  goalId: string;
  amountCents: number;
  date?: string;
  note?: string | null;
};

function assertPositiveCents(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer (cents)`);
  }
}

function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Active (non-archived) goals with saved total and raw progress ratio. */
export async function listGoals(): Promise<GoalWithProgress[]> {
  const db = await getDb();
  const rows = await db
    .select({
      goal: savingsGoals,
      saved: sql<string>`coalesce(sum(${savingsContributions.amountCents}), 0)`,
    })
    .from(savingsGoals)
    .leftJoin(savingsContributions, eq(savingsContributions.goalId, savingsGoals.id))
    .where(isNull(savingsGoals.archivedAt))
    .groupBy(savingsGoals.id)
    .orderBy(asc(savingsGoals.createdAt));
  return rows.map(({ goal, saved }) => {
    const savedCents = Number(saved);
    return { ...goal, savedCents, pct: goal.targetCents > 0 ? savedCents / goal.targetCents : 0 };
  });
}

export async function createGoal(data: GoalInput): Promise<SavingsGoal> {
  assertPositiveCents(data.targetCents, "targetCents");
  const db = await getDb();
  const [row] = await db
    .insert(savingsGoals)
    .values({
      name: data.name,
      targetCents: data.targetCents,
      emoji: data.emoji ?? null,
      color: data.color ?? null,
    })
    .returning();
  return row;
}

export async function updateGoal(id: string, data: Partial<GoalInput>): Promise<SavingsGoal> {
  const patch: Partial<typeof savingsGoals.$inferInsert> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.targetCents !== undefined) {
    assertPositiveCents(data.targetCents, "targetCents");
    patch.targetCents = data.targetCents;
  }
  if (data.emoji !== undefined) patch.emoji = data.emoji;
  if (data.color !== undefined) patch.color = data.color;
  const db = await getDb();
  if (Object.keys(patch).length === 0) {
    const [row] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id));
    return row;
  }
  const [row] = await db.update(savingsGoals).set(patch).where(eq(savingsGoals.id, id)).returning();
  return row;
}

export async function archiveGoal(id: string): Promise<void> {
  const db = await getDb();
  await db
    .update(savingsGoals)
    .set({ archivedAt: new Date() })
    .where(and(eq(savingsGoals.id, id), isNull(savingsGoals.archivedAt)));
}

export async function addContribution(data: ContributionInput): Promise<SavingsContribution> {
  assertPositiveCents(data.amountCents, "amountCents");
  const db = await getDb();
  const [row] = await db
    .insert(savingsContributions)
    .values({
      goalId: data.goalId,
      amountCents: data.amountCents,
      date: data.date ?? todayLocal(),
      note: data.note ?? null,
    })
    .returning();
  return row;
}

/** Newest first (by date, then creation time). */
export async function listContributions(goalId: string): Promise<SavingsContribution[]> {
  const db = await getDb();
  return db
    .select()
    .from(savingsContributions)
    .where(eq(savingsContributions.goalId, goalId))
    .orderBy(desc(savingsContributions.date), desc(savingsContributions.createdAt));
}
