"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { removeTransaction } from "@/app/actions";

export type TransactionRowData = {
  id: string;
  amount: string; // pre-formatted, e.g. "12.34"
  category: string;
  note: string | null;
  date: string;
};

export default function TransactionRow({
  tx,
  onEdit,
}: {
  tx: TransactionRowData;
  onEdit?: (tx: TransactionRowData) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: pending ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgb(15_23_42/0.05)] ring-1 ring-slate-100"
    >
      <div
        role={onEdit ? "button" : undefined}
        tabIndex={onEdit ? 0 : undefined}
        onClick={onEdit ? () => onEdit(tx) : undefined}
        onKeyDown={
          onEdit
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEdit(tx);
                }
              }
            : undefined
        }
        className={`flex min-w-0 flex-1 items-center gap-3 ${onEdit ? "cursor-pointer" : ""}`}
      >
       <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
            {tx.category}
          </span>
          <span className="text-xs text-slate-400">{tx.date}</span>
        </div>
        {tx.note && <p className="mt-1 truncate text-sm text-slate-600">{tx.note}</p>}
       </div>
       <span className="font-display text-lg font-semibold tabular-nums">${tx.amount}</span>
      </div>
      <button
        type="button"
        aria-label="Delete transaction"
        disabled={pending}
        onClick={() => startTransition(() => removeTransaction(tx.id))}
        className="-mr-1 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:bg-slate-100 active:text-red-600"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </motion.li>
  );
}
