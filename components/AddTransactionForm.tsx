"use client";

import { useActionState, useEffect, useState } from "react";
import { addTransaction, type AddState } from "@/app/actions";
import AmountInput from "./AmountInput";
import CategoryTagInput from "./CategoryTagInput";

export default function AddTransactionForm({
  categories,
}: {
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState<AddState, FormData>(addTransaction, null);
  // All fields are controlled so React 19's post-action form reset can't wipe
  // the user's input when validation fails.
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  // "" on first render (no hydration mismatch); set to the client's local day after mount.
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-CA"));
  }, []);

  useEffect(() => {
    if (state?.ok) {
      setAmount("");
      setCategory("");
      setNote("");
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.06)] ring-1 ring-slate-100"
    >
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
        {pending ? "Adding..." : "Add transaction"}
      </button>
    </form>
  );
}
