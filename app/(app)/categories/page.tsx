import CategoryEditor from "@/components/CategoryEditor";
import { listCategories, UNCATEGORIZED_NAME } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await listCategories();
  const items = rows.map((c) => ({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    color: c.color,
    protected: c.name === UNCATEGORIZED_NAME,
  }));
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-24 pt-6">
      <h1 className="mb-1 font-display text-2xl font-semibold text-slate-900">Categories</h1>
      <p className="mb-5 text-sm text-slate-500">
        Deleting a category moves its transactions to Uncategorized.
      </p>
      <CategoryEditor categories={items} />
    </main>
  );
}
