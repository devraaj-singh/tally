import SavingsView from "@/components/SavingsView";
import { listGoals } from "@/lib/data/savings";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const goals = await listGoals();
  const items = goals.map((g) => ({
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    color: g.color,
    targetCents: g.targetCents,
    savedCents: g.savedCents,
    pct: g.pct,
  }));
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-24 pt-6">
      <h1 className="mb-1 font-display text-2xl font-semibold text-slate-900">Savings</h1>
      <p className="mb-5 text-sm text-slate-500">Set goals and watch them fill up.</p>
      <SavingsView goals={items} />
    </main>
  );
}
