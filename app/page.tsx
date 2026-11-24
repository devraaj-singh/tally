import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import { formatCents } from "@/lib/money";
import { listCategories } from "@/lib/data/categories";
import { listTransactions, monthlyTotalCents } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const [categories, txs, total] = await Promise.all([
    listCategories(),
    listTransactions({ month }),
    monthlyTotalCents(month),
  ]);
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-16 pt-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">{monthLabel} &middot; spent</p>
        <p className="font-display text-6xl font-semibold tracking-tight text-slate-900">
          <span className="text-accent-600">$</span>
          {formatCents(total)}
        </p>
      </header>

      <AddTransactionForm categories={categories.map((c) => c.name)} />

      <section className="mt-8">
        <TransactionList
          items={txs.map((t) => ({
            id: t.id,
            amount: formatCents(t.amountCents),
            category: (t.categoryId && names.get(t.categoryId)) || "Uncategorized",
            note: t.note,
            date: t.date,
          }))}
        />
      </section>
    </main>
  );
}
