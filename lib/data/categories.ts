import { asc, eq } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { categories, transactions } from "../db/schema.ts";

export const UNCATEGORIZED_NAME = "Uncategorized";

export type CategoryInput = { name: string; color?: string | null; emoji?: string | null };

export async function listCategories() {
  const db = await getDb();
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function createCategory(data: CategoryInput) {
  const db = await getDb();
  const [row] = await db
    .insert(categories)
    .values({ name: data.name, color: data.color ?? null, emoji: data.emoji ?? null })
    .returning();
  return row;
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  const db = await getDb();
  const patch: Partial<typeof categories.$inferInsert> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.color !== undefined) patch.color = data.color;
  if (data.emoji !== undefined) patch.emoji = data.emoji;
  if (Object.keys(patch).length === 0) {
    const [row] = await db.select().from(categories).where(eq(categories.id, id));
    return row;
  }
  const [row] = await db.update(categories).set(patch).where(eq(categories.id, id)).returning();
  return row;
}

/** Returns the id of the "Uncategorized" category, creating it if missing. */
export async function ensureUncategorized(): Promise<string> {
  const db = await getDb();
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, UNCATEGORIZED_NAME))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(categories)
    .values({ name: UNCATEGORIZED_NAME, color: "#94a3b8", emoji: "📦" })
    .returning({ id: categories.id });
  return created.id;
}

/**
 * Deletes a category, first moving its transactions to "Uncategorized" so no
 * transaction is ever lost. Neon HTTP has no interactive transactions, so these
 * are two sequential statements: reassign, then delete.
 */
export async function deleteCategory(id: string): Promise<void> {
  const uncategorizedId = await ensureUncategorized();
  if (id === uncategorizedId) throw new Error("Cannot delete the Uncategorized category");

  const db = await getDb();
  await db
    .update(transactions)
    .set({ categoryId: uncategorizedId })
    .where(eq(transactions.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}
