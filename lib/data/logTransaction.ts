import { parseAmountToCents } from "../money.ts";
import { resolveCategoryByName } from "./categories.ts";
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

  const category = await resolveCategoryByName(input.categoryName);
  if ("error" in category) return { error: category.error };

  const note = input.note?.trim();
  await createTransaction({
    amountCents: parsed.cents,
    categoryId: category.id,
    date: input.date?.trim() || new Date().toISOString().slice(0, 10),
    note: note ? note : null,
  });
  return { ok: true };
}
