"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { DEMO_MODE } from "../lib/constants.ts";
import { SESSION_COOKIE, isValidSession } from "../lib/auth.ts";
import { logTransaction } from "@/lib/data/logTransaction";
import { deleteTransaction } from "@/lib/data/transactions";

export type AddState = { error?: string; ok?: number } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

// Defense in depth: server actions re-check the session instead of trusting middleware alone.
async function isAuthorized(): Promise<boolean> {
  if (DEMO_MODE) return true;
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE)?.value);
}

export async function addTransaction(_prev: AddState, formData: FormData): Promise<AddState> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
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
  if (!(await isAuthorized())) return;
  await deleteTransaction(id);
  revalidatePath("/");
}
