import Link from "next/link";
import TransactionList from "@/components/TransactionList";
import { getActiveMonth } from "@/lib/active-date";
import { formatCents } from "@/lib/money";
import { listCategories } from "@/lib/data/categories";
import { listTransactions } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";

function shiftMonth(month: string, delta: number): string {
  const d = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function href(month: string, categoryId?: string) {
  const q = new URLSearchParams({ month });
  if (categoryId) q.set("categoryId", categoryId);
  return `/history?${q.toString()}`;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; categoryId?: string }>;
}) {
  const sp = await searchParams;
  const month = await getActiveMonth(sp.month);
  const categories = await listCategories();
  // Ignore unknown/garbage category ids rather than querying with them.
  const categoryId = categories.some((c) => c.id === sp.categoryId) ? sp.categoryId : undefined;
  const txs = await listTransactions({ month, categoryId });
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const total = txs.reduce((sum, t) => sum + t.amountCents, 0);
  const monthLabel = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1))
    .toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-accent-600 text-white" : "bg-slate-100 text-slate-700 active:bg-slate-200"
    }`;
  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 active:bg-slate-100";

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-16 pt-6">
      <nav className="mb-5 flex items-center justify-between" aria-label="Month">
        <Link href={href(shiftMonth(month, -1), categoryId)} aria-label="Previous month" className={arrow}>
          &lsaquo;
        </Link>
        <h1 className="font-display text-xl font-semibold text-slate-900">{monthLabel}</h1>
        <Link href={href(shiftMonth(month, 1), categoryId)} aria-label="Next month" className={arrow}>
          &rsaquo;
        </Link>
      </nav>

      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Filter by category">
        <Link href={href(month)} aria-current={!categoryId} className={chip(!categoryId)}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href(month, c.id)} aria-current={categoryId === c.id} className={chip(categoryId === c.id)}>
            {c.name}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm font-medium text-slate-500">
        {txs.length} {txs.length === 1 ? "transaction" : "transactions"} &middot;{" "}
        <span className="font-display font-semibold text-slate-900">
          <span className="text-accent-600">$</span>
          {formatCents(total)}
        </span>
      </p>

      <TransactionList
        categories={categories.map((c) => c.name)}
        empty={{ title: "Nothing here", hint: "No transactions match this month and filter." }}
        items={txs.map((t) => ({
          id: t.id,
          amount: formatCents(t.amountCents),
          category: (t.categoryId && names.get(t.categoryId)) || "Uncategorized",
          note: t.note,
          date: t.date,
        }))}
      />
    </main>
  );
}
