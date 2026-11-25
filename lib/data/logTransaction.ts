import { parseAmountToCents } from "../money.ts";
import { createCategory, listCategories } from "./categories.ts";
import { createTransaction } from "./transactions.ts";

export type LogTransactionInput = {
  amount: string;
  categoryName: string;
  note?: string;
  date?: string; // "YYYY-MM-DD" local day; the add form always supplies it. Fallback is server-UTC only.
};

/** Next-free core of the "add" flow: validate, resolve/create the category tag, insert. */
export async function logTransaction(
  input: LogTransactionInput,
): Promise<{ error: string } | { ok: true }> {
  const parsed = parseAmountToCents(input.amount);
  if ("error" in parsed) return { error: parsed.error };

  const name = input.categoryName.trim();
  if (name === "") return { error: "Pick or type a category" };

  const existing = (await listCategories()).find(
    (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
  );
  const category = existing ?? (await createCategory({ name }));

  const note = input.note?.trim();
  await createTransaction({
    amountCents: parsed.cents,
    categoryId: category.id,
    date: input.date?.trim() || new Date().toISOString().slice(0, 10),
    note: note ? note : null,
  });
  return { ok: true };
}
