"use server";

import { revalidatePath } from "next/cache";
import { logTransaction } from "@/lib/data/logTransaction";
import { deleteTransaction } from "@/lib/data/transactions";

export type AddState = { error?: string; ok?: number } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function addTransaction(_prev: AddState, formData: FormData): Promise<AddState> {
  const result = await logTransaction({
    amount: str(formData.get("amount")),
    categoryName: str(formData.get("category")),
    note: str(formData.get("note")),
    date: str(formData.get("date")) || undefined,
  });
  if ("error" in result) return { error: result.error };
  revalidatePath("/");
  return { ok: Date.now() };
}

export async function removeTransaction(id: string): Promise<void> {
  await deleteTransaction(id);
  revalidatePath("/");
}
