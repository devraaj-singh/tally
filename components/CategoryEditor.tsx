"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addCategory, editCategory, removeCategory } from "@/app/(app)/categories/actions";
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "@/lib/category-input";

export type CategoryItem = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  protected: boolean;
};

const FALLBACK_COLOR = "#64748b";

function Picker({
  emoji, color, onEmoji, onColor,
}: { emoji: string; color: string; onEmoji: (e: string) => void; onColor: (c: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Emoji">
        {CATEGORY_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onEmoji(e)}
            aria-pressed={emoji === e}
            className={`h-9 w-9 rounded-lg text-lg ${emoji === e ? "bg-accent-100 ring-2 ring-accent-500" : "bg-slate-50 ring-1 ring-slate-200"}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Color">
        {CATEGORY_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColor(c)}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            style={{ backgroundColor: c }}
            className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-900" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function Form({
  initial, id, submitLabel, onDone,
}: {
  initial: { name: string; emoji: string; color: string };
  id?: string;
  submitLabel: string;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [color, setColor] = useState(initial.color);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    const fd = new FormData();
    if (id) fd.set("id", id);
    fd.set("name", name);
    fd.set("emoji", emoji);
    fd.set("color", color);
    start(async () => {
      const res = await (id ? editCategory(fd) : addCategory(fd));
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        maxLength={40}
        aria-label="Category name"
        className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-base ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
      <Picker emoji={emoji} color={color} onEmoji={setEmoji} onColor={setColor} />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={pending}
          className="flex-1 rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onDone} disabled={pending}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Row({ item }: { item: CategoryItem }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <Form
        id={item.id}
        initial={{ name: item.name, emoji: item.emoji ?? "", color: item.color ?? CATEGORY_COLORS[0] }}
        submitLabel="Save"
        onDone={() => setEditing(false)}
      />
    );
  }

  function del() {
    start(async () => {
      const res = await removeCategory(item.id);
      if (res.error) { setError(res.error); setConfirming(false); }
    });
  }

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">{item.emoji ?? "🏷️"}</span>
        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color ?? FALLBACK_COLOR }} aria-hidden="true" />
        <span className="flex-1 truncate font-medium text-slate-900">{item.name}</span>
        <button type="button" onClick={() => setEditing(true)} className="rounded-lg px-2 py-1 text-sm text-accent-700">
          Edit
        </button>
        {!item.protected && !confirming && (
          <button type="button" onClick={() => setConfirming(true)} className="rounded-lg px-2 py-1 text-sm text-red-600">
            Delete
          </button>
        )}
      </div>
      {confirming && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="flex-1 text-slate-600">Move its transactions to Uncategorized?</span>
          <button type="button" onClick={del} disabled={pending} className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white disabled:opacity-60">
            {pending ? "..." : "Delete"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="px-2 py-1.5 text-slate-600">
            Keep
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function CategoryEditor({ categories }: { categories: CategoryItem[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-2.5">
      <ul className="space-y-2.5">
        <AnimatePresence initial={false}>
          {categories.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <Row item={c} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {adding ? (
        <Form
          initial={{ name: "", emoji: CATEGORY_EMOJIS[0], color: CATEGORY_COLORS[0] }}
          submitLabel="Add category"
          onDone={() => setAdding(false)}
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="w-full rounded-2xl border-2 border-dashed border-accent-300 py-3 text-sm font-semibold text-accent-700">
          + New category
        </button>
      )}
    </div>
  );
}
