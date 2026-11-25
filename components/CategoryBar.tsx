"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type CategoryBarProps = {
  href?: string;
  emoji: string;
  name: string;
  amount: string;
  percent: number; // 0-100
  color: string;
  index: number;
};

export default function CategoryBar({ href, emoji, name, amount, percent, color, index }: CategoryBarProps) {
  const body = (
    <>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-medium text-slate-800">
          <span aria-hidden className="mr-2">{emoji}</span>
          {name}
        </span>
        <span className="shrink-0 text-sm text-slate-500">
          <span className="font-display font-semibold text-slate-900">${amount}</span> &middot; {Math.round(percent)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
        />
      </div>
    </>
  );
  const cls = "block rounded-2xl bg-white p-4 ring-1 ring-slate-100";
  return href ? (
    <Link href={href} className={`${cls} transition-colors active:bg-slate-50`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
