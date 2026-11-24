"use client";

import { useState } from "react";

export default function CategoryTagInput({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = value.trim().toLowerCase();
  const isNew = active !== "" && !categories.some((c) => c.toLowerCase() === active);

  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</span>
      {categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = c.toLowerCase() === active;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(selected ? "" : c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-accent-600 text-white"
                    : "bg-slate-100 text-slate-700 active:bg-slate-200"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}
      <input
        name="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        placeholder={categories.length ? "...or type a new tag" : "Type a tag, e.g. Food"}
        className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 text-base ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
      {isNew && !focused && (
        <p className="mt-1 text-xs text-slate-500">New tag &ldquo;{value.trim()}&rdquo; will be created.</p>
      )}
    </div>
  );
}
