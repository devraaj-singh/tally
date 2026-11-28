"use server";

import { revalidatePath } from "next/cache";
import { isAuthorized } from "../../../lib/auth-helpers.ts";
import { parseAmountToCents } from "@/lib/money";
import { addContribution, archiveGoal, createGoal } from "@/lib/data/savings";

export type SavingsResult = { error?: string; ok?: true };

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const HEX = /^#[0-9a-fA-F]{6}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function refresh() {
  revalidatePath("/savings");
  revalidatePath("/");
}

export async function createSavingsGoal(formData: FormData): Promise<SavingsResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  const name = str(formData.get("name")).trim();
  if (name === "") return { error: "Enter a goal name" };
  if (name.length > 60) return { error: "Name must be 60 characters or fewer" };
  const target = parseAmountToCents(str(formData.get("target")));
  if ("error" in target) return { error: target.error };
  if (target.cents <= 0) return { error: "Target must be greater than zero" };
  const color = str(formData.get("color")).trim();
  if (color !== "" && !HEX.test(color)) return { error: "Pick a valid color" };
  const emoji = str(formData.get("emoji")).trim();
  if (emoji.length > 16) return { error: "Pick a single emoji" };
  try {
    await createGoal({ name, targetCents: target.cents, emoji: emoji || null, color: color || null });
  } catch {
    return { error: "Could not create goal" };
  }
  refresh();
  return { ok: true };
}

export async function addSavingsContribution(formData: FormData): Promise<SavingsResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  const goalId = str(formData.get("goalId"));
  if (goalId === "") return { error: "Missing goal" };
  const amount = parseAmountToCents(str(formData.get("amount")));
  if ("error" in amount) return { error: amount.error };
  if (amount.cents <= 0) return { error: "Amount must be greater than zero" };
  const date = str(formData.get("date"));
  if (!DATE.test(date)) return { error: "Pick a valid date" };
  const note = str(formData.get("note")).trim().slice(0, 200);
  try {
    await addContribution({ goalId, amountCents: amount.cents, date, note: note || null });
  } catch {
    return { error: "Could not add contribution" };
  }
  refresh();
  return { ok: true };
}

export async function archiveSavingsGoal(goalId: string): Promise<SavingsResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  if (!goalId) return { error: "Missing goal" };
  try {
    await archiveGoal(goalId);
  } catch {
    return { error: "Could not archive goal" };
  }
  refresh();
  return { ok: true };
}
