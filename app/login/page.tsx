"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(signIn, null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-accent-600">Tally</h1>
      <p className="mt-2 font-sans text-slate-600">Enter the password to continue.</p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <label htmlFor="password" className="font-sans text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          disabled={pending}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-sans focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/30"
        />
        {error ? (
          <p role="alert" className="font-sans text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent-600 px-4 py-3 font-sans text-base font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </main>
  );
}
