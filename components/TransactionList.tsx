"use client";

import { AnimatePresence } from "framer-motion";
import TransactionRow, { type TransactionRowData } from "./TransactionRow";

export default function TransactionList({ items }: { items: TransactionRowData[] }) {
  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
