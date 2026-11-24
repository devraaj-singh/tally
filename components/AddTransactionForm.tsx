"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTransaction, type AddState } from "@/app/actions";
import AmountInput from "./AmountInput";
import CategoryTagInput from "./CategoryTagInput";

export default function AddTransactionForm({
  categories,
  today,
}: {
  categories: string[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState<AddState, FormData>(addTransaction, null);
  const [category, setCategory] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setCategory("");
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.06)] ring-1 ring-slate-100"
    >
      <AmountInput disabled={pending} />
      <CategoryTagInput categories={categories} value={category} onChange={setCategory} />
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <input
          name="note"
          placeholder="Note (optional)"
          autoComplete="off"
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-base ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <input
          name="date"
          type="date"
          defaultValue={today}
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
        {pending ? "Adding..." : "Add transaction"}
      </button>
    </form>
  );
}
