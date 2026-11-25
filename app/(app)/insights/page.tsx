import Link from "next/link";
import CategoryBar from "@/components/CategoryBar";
import { getActiveMonth } from "@/lib/active-date";
import { formatCents } from "@/lib/money";
import { breakdownByCategory, monthlyTotalCents } from "@/lib/data/transactions";

export const dynamic = "force-dynamic";

const FALLBACK_COLOR = "#059669";
const HEX = /^#[0-9a-fA-F]{3,8}$/;

function shiftMonth(month: string, delta: number): string {
  const d = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const month = await getActiveMonth(sp.month);
  const [rows, total] = await Promise.all([breakdownByCategory(month), monthlyTotalCents(month)]);
  const shown = rows.filter((r) => r.totalCents > 0);
  const categorized = shown.reduce((s, r) => s + r.totalCents, 0);
  const uncategorized = Math.max(0, total - categorized);
  const pct = (cents: number) => (total > 0 ? (cents / total) * 100 : 0);
  const monthLabel = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1))
    .toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const arrow =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 active:bg-slate-100";

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-24 pt-6">
      <nav className="mb-5 flex items-center justify-between" aria-label="Month">
        <Link href={`/insights?month=${shiftMonth(month, -1)}`} aria-label="Previous month" className={arrow}>
          &lsaquo;
        </Link>
        <h1 className="font-display text-xl font-semibold text-slate-900">{monthLabel}</h1>
        <Link href={`/insights?month=${shiftMonth(month, 1)}`} aria-label="Next month" className={arrow}>
          &rsaquo;
        </Link>
      </nav>

      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-slate-500">Total spent</p>
        <p className="font-display text-5xl font-semibold text-slate-900">
          <span className="text-accent-600">$</span>
          {formatCents(total)}
        </p>
      </div>

      {total <= 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100">
          <p className="mb-2 text-4xl" aria-hidden>🌱</p>
          <p className="font-display text-lg font-semibold text-slate-900">No spending yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Nothing logged for {monthLabel}. Add a transaction and your breakdown will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((r, i) => (
            <li key={r.categoryId}>
              <CategoryBar
                href={`/history?${new URLSearchParams({ month, categoryId: r.categoryId }).toString()}`}
                emoji={r.emoji ?? "🏷️"}
                name={r.name}
                amount={formatCents(r.totalCents)}
                percent={pct(r.totalCents)}
                color={r.color && HEX.test(r.color) ? r.color : FALLBACK_COLOR}
                index={i}
              />
            </li>
          ))}
          {uncategorized > 0 && (
            <li>
              <CategoryBar
                emoji="❔"
                name="Uncategorized"
                amount={formatCents(uncategorized)}
                percent={pct(uncategorized)}
                color="#94a3b8"
                index={shown.length}
              />
            </li>
          )}
        </ul>
      )}
    </main>
  );
}
