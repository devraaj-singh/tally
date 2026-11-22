import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { categories, transactions } from "../db/schema.ts";
import { monthRange } from "./month.ts";

export type TransactionInput = {
  amountCents: number;
  categoryId: string;
  date: string; // "YYYY-MM-DD"
  note?: string | null;
};

export type TransactionFilter = { month?: string; categoryId?: string };

function assertPositiveCents(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("amountCents must be a positive integer");
  }
}

export async function listTransactions(filter: TransactionFilter = {}) {
  const db = await getDb();
  const conditions = [];
  if (filter.month !== undefined) {
    const { start, end } = monthRange(filter.month);
    conditions.push(gte(transactions.date, start), lt(transactions.date, end));
  }
  if (filter.categoryId !== undefined) {
    conditions.push(eq(transactions.categoryId, filter.categoryId));
  }
  return db
    .select()
    .from(transactions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}

export async function createTransaction(data: TransactionInput) {
  assertPositiveCents(data.amountCents);
  const db = await getDb();
  const [row] = await db
    .insert(transactions)
    .values({
      amountCents: data.amountCents,
      categoryId: data.categoryId,
      date: data.date,
      note: data.note ?? null,
    })
    .returning();
  return row;
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>,
) {
  if (data.amountCents !== undefined) assertPositiveCents(data.amountCents);
  const db = await getDb();
  const patch: Partial<typeof transactions.$inferInsert> = {};
  if (data.amountCents !== undefined) patch.amountCents = data.amountCents;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.date !== undefined) patch.date = data.date;
  if (data.note !== undefined) patch.note = data.note;
  if (Object.keys(patch).length === 0) {
    const [row] = await db.select().from(transactions).where(eq(transactions.id, id));
    return row;
  }
  const [row] = await db
    .update(transactions)
    .set(patch)
    .where(eq(transactions.id, id))
    .returning();
  return row;
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(transactions).where(eq(transactions.id, id));
}

export async function monthlyTotalCents(month: string): Promise<number> {
  const db = await getDb();
  const { start, end } = monthRange(month);
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${transactions.amountCents}), 0)` })
    .from(transactions)
    .where(and(gte(transactions.date, start), lt(transactions.date, end)));
  return Number(row.total);
}

export async function breakdownByCategory(month: string): Promise<
  { categoryId: string; name: string; color: string | null; emoji: string | null; totalCents: number }[]
> {
  const db = await getDb();
  const { start, end } = monthRange(month);
  const rows = await db
    .select({
      categoryId: categories.id,
      name: categories.name,
      color: categories.color,
      emoji: categories.emoji,
      total: sql<string>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(gte(transactions.date, start), lt(transactions.date, end)))
    .groupBy(categories.id, categories.name, categories.color, categories.emoji)
    .orderBy(desc(sql`sum(${transactions.amountCents})`));

  return rows.map((r) => ({
    categoryId: r.categoryId,
    name: r.name,
    color: r.color,
    emoji: r.emoji,
    totalCents: Number(r.total),
  }));
}
