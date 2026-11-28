"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  addSavingsContribution,
  archiveSavingsGoal,
  createSavingsGoal,
} from "@/app/(app)/savings/actions";
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "@/lib/category-input";
import { formatCents } from "@/lib/money";
import AmountInput from "@/components/AmountInput";

export type GoalItem = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  targetCents: number;
  savedCents: number;
  pct: number;
};

const FALLBACK_COLOR = "#059669";
const inputCls =
  "w-full rounded-xl bg-slate-50 px-3 py-2.5 text-base ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500";

function CreateForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState(CATEGORY_EMOJIS[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("target", target);
    fd.set("emoji", emoji);
    fd.set("color", color);
    start(async () => {
      const res = await createSavingsGoal(fd);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name (e.g. Vacation)"
        maxLength={60} aria-label="Goal name" className={inputCls} />
      <AmountInput value={target} onChange={setTarget} disabled={pending} label="Target" />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Emoji">
        {CATEGORY_EMOJIS.map((e) => (
          <button key={e} type="button" onClick={() => setEmoji(e)} aria-pressed={emoji === e}
            className={`h-9 w-9 rounded-lg text-lg ${emoji === e ? "bg-accent-100 ring-2 ring-accent-500" : "bg-slate-50 ring-1 ring-slate-200"}`}>
            {e}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Color">
        {CATEGORY_COLORS.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`}
            aria-pressed={color === c} style={{ backgroundColor: c }}
            className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-900" : ""}`} />
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={pending}
          className="flex-1 rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving..." : "Create goal"}
        </button>
        <button type="button" onClick={onDone} disabled={pending}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ContributeForm({ goalId, onDone }: { goalId: string; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    const fd = new FormData();
    fd.set("goalId", goalId);
    fd.set("amount", amount);
    fd.set("note", note);
    fd.set("date", date);
    start(async () => {
      const res = await addSavingsContribution(fd);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      <AmountInput value={amount} onChange={setAmount} disabled={pending} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
        maxLength={200} aria-label="Note" className={inputCls} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" className={inputCls} />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={pending}
          className="flex-1 rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Adding..." : "Add"}
        </button>
        <button type="button" onClick={onDone} disabled={pending}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalItem }) {
  const [adding, setAdding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ratio = Number.isFinite(goal.pct) ? goal.pct : 0;
  const shown = Math.max(0, Math.min(ratio, 1));
  const label = Math.round(Math.max(0, ratio) * 100);
  const color = goal.color ?? FALLBACK_COLOR;

  function archive() {
    start(async () => {
      const res = await archiveSavingsGoal(goal.id);
      if (res.error) { setError(res.error); setConfirming(false); }
    });
  }

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{goal.emoji ?? "🎯"}</span>
        <span className="flex-1 truncate font-medium text-slate-900">{goal.name}</span>
        <span className="font-display text-lg font-semibold text-slate-900">{label}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(label, 100)}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${shown * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Saved <span className="font-medium text-slate-800">{formatCents(goal.savedCents)}</span> of {formatCents(goal.targetCents)}
      </p>
      {!adding && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <button type="button" onClick={() => setAdding(true)}
            className="rounded-xl bg-accent-50 px-3 py-1.5 font-semibold text-accent-700">
            + Add money
          </button>
          <span className="flex-1" />
          {!confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="rounded-lg px-2 py-1 text-red-600">
              Archive
            </button>
          )}
        </div>
      )}
      {confirming && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="flex-1 text-slate-600">Archive this goal?</span>
          <button type="button" onClick={archive} disabled={pending}
            className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white disabled:opacity-60">
            {pending ? "..." : "Archive"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="px-2 py-1.5 text-slate-600">
            Keep
          </button>
        </div>
      )}
      {adding && <ContributeForm goalId={goal.id} onDone={() => setAdding(false)} />}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function SavingsView({ goals }: { goals: GoalItem[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-3">
      {goals.length === 0 && !creating && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-4xl" aria-hidden="true">🐷</div>
          <p className="mt-3 font-display text-lg font-semibold text-slate-900">Create your first savings goal</p>
          <p className="mt-1 text-sm text-slate-500">Pick something to save for and track your progress.</p>
        </div>
      )}
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {goals.map((g) => (
            <motion.li key={g.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
              <GoalCard goal={g} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {creating ? (
        <CreateForm onDone={() => setCreating(false)} />
      ) : (
        <button type="button" onClick={() => setCreating(true)}
          className="w-full rounded-2xl border-2 border-dashed border-accent-300 py-3 text-sm font-semibold text-accent-700">
          + New goal
        </button>
      )}
    </div>
  );
}
