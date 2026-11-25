"use server";

import { revalidatePath } from "next/cache";
import { isAuthorized } from "../../lib/auth-helpers.ts";
import { parseAmountToCents } from "@/lib/money";
import { resolveCategoryByName } from "@/lib/data/categories";
import { updateTransaction } from "@/lib/data/transactions";

export type EditState = { error?: string; ok?: number } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function editTransaction(_prev: EditState, formData: FormData): Promise<EditState> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  try {
    const id = str(formData.get("id"));
    if (!id) return { error: "Missing transaction" };

    const parsed = parseAmountToCents(str(formData.get("amount")));
    if ("error" in parsed) return { error: parsed.error };

    const date = str(formData.get("date")).trim();
    if (!DAY.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      return { error: "Pick a valid date" };
    }
    const note = str(formData.get("note")).trim();

    // Resolve/create the category last so invalid input never leaves an orphan tag.
    const category = await resolveCategoryByName(str(formData.get("category")));
    if ("error" in category) return { error: category.error };

    const row = await updateTransaction(id, {
      amountCents: parsed.cents,
      categoryId: category.id,
      date,
      note: note ? note : null,
    });
    if (!row) return { error: "Transaction not found" };
  } catch {
    return { error: "Could not save changes. Try again." };
  }
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: Date.now() };
}
