"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { editTransaction, type EditState } from "@/app/(app)/actions";
import AmountInput from "./AmountInput";
import CategoryTagInput from "./CategoryTagInput";
import type { TransactionRowData } from "./TransactionRow";

export default function EditTransactionSheet({
  tx,
  categories,
  onClose,
}: {
  tx: TransactionRowData | null;
  categories: string[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {tx && <Sheet key={tx.id} tx={tx} categories={categories} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Sheet({
  tx,
  categories,
  onClose,
}: {
  tx: TransactionRowData;
  categories: string[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(editTransaction, null);
  const [amount, setAmount] = useState(tx.amount);
  const [category, setCategory] = useState(tx.category);
  const [note, setNote] = useState(tx.note ?? "");
  const [date, setDate] = useState(tx.date);

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-slate-900/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.form
        action={formAction}
        role="dialog"
        aria-label="Edit transaction"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="relative max-h-[90dvh] w-full max-w-md space-y-5 overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <input type="hidden" name="id" value={tx.id} />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">Edit transaction</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <AmountInput value={amount} onChange={setAmount} disabled={pending} />
        <CategoryTagInput categories={categories} value={category} onChange={setCategory} />
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            autoComplete="off"
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-base ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <input
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl bg-slate-50 px-3 py-3 text-base ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-accent-600 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] active:bg-accent-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </motion.form>
    </div>
  );
}
