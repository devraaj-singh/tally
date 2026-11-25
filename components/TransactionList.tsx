"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditTransactionSheet from "./EditTransactionSheet";
import TransactionRow, { type TransactionRowData } from "./TransactionRow";

export default function TransactionList({
  items,
  categories,
  empty,
}: {
  items: TransactionRowData[];
  categories: string[];
  empty?: { title: string; hint: string };
}) {
  const [editing, setEditing] = useState<TransactionRowData | null>(null);
  return (
    <div>
      <EditTransactionSheet tx={editing} categories={categories} onClose={() => setEditing(null)} />
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onEdit={setEditing} />
          ))}
        </AnimatePresence>
      </ul>
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="rounded-3xl border border-dashed border-slate-200 px-6 py-10 text-center"
          >
            <p className="font-display text-lg font-semibold text-slate-700">
              {empty?.title ?? "Log your first transaction"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {empty?.hint ?? "Add an amount and a tag above to start tracking this month."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
