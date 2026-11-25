"use server";

import { revalidatePath } from "next/cache";
import { isAuthorized } from "../../../lib/auth-helpers.ts";
import { parseCategoryInput } from "@/lib/category-input";
import {
  UNCATEGORIZED_NAME,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/data/categories";

export type CategoryResult = { error?: string; ok?: true };

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

function refresh() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/insights");
  revalidatePath("/history");
}

async function nameTaken(name: string, exceptId?: string) {
  return (await listCategories()).some(
    (c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.toLowerCase(),
  );
}

export async function addCategory(formData: FormData): Promise<CategoryResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  try {
    const parsed = parseCategoryInput({
      name: str(formData.get("name")),
      emoji: str(formData.get("emoji")),
      color: str(formData.get("color")),
    });
    if ("error" in parsed) return { error: parsed.error };
    if (await nameTaken(parsed.name)) return { error: "That category already exists" };
    await createCategory(parsed);
  } catch {
    return { error: "Could not add category. Try again." };
  }
  refresh();
  return { ok: true };
}

export async function editCategory(formData: FormData): Promise<CategoryResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  try {
    const id = str(formData.get("id"));
    if (!id) return { error: "Missing category" };
    const parsed = parseCategoryInput({
      name: str(formData.get("name")),
      emoji: str(formData.get("emoji")),
      color: str(formData.get("color")),
    });
    if ("error" in parsed) return { error: parsed.error };
    const current = (await listCategories()).find((c) => c.id === id);
    if (!current) return { error: "Category not found" };
    if (current.name === UNCATEGORIZED_NAME && parsed.name !== UNCATEGORIZED_NAME) {
      return { error: "Uncategorized can't be renamed" };
    }
    if (await nameTaken(parsed.name, id)) return { error: "That category already exists" };
    await updateCategory(id, parsed);
  } catch {
    return { error: "Could not save changes. Try again." };
  }
  refresh();
  return { ok: true };
}

export async function removeCategory(id: string): Promise<CategoryResult> {
  if (!(await isAuthorized())) return { error: "Not authorized" };
  try {
    if (!id) return { error: "Missing category" };
    const current = (await listCategories()).find((c) => c.id === id);
    if (!current) return { error: "Category not found" };
    if (current.name === UNCATEGORIZED_NAME) return { error: "Uncategorized can't be deleted" };
    await deleteCategory(id);
  } catch {
    return { error: "Could not delete category. Try again." };
  }
  refresh();
  return { ok: true };
}
