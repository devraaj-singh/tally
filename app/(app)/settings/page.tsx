import Link from "next/link";
import { DEMO_MODE } from "@/lib/constants";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

const card = "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200";
const row = "flex items-center justify-between px-4 py-3.5";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-accent-50/60 to-white px-5 pb-24 pt-6">
      <h1 className="mb-5 font-display text-2xl font-semibold text-slate-900">Settings</h1>

      <div className={`${card} divide-y divide-slate-100`}>
        <Link href="/categories" className={`${row} text-slate-900 active:bg-slate-50`}>
          <span className="font-medium">Categories</span>
          <span className="text-slate-400" aria-hidden="true">&rsaquo;</span>
        </Link>
        {/* TODO(later task): Appearance / Dark mode. Placeholder only, not functional. */}
        <div className={`${row} text-slate-400`} aria-disabled="true">
          <span className="font-medium">Appearance</span>
          <span className="text-sm">Dark mode: coming soon</span>
        </div>
        <div className={row}>
          <span className="font-medium text-slate-900">About Tally</span>
          <span className="text-sm text-slate-500">Version 0.1.0</span>
        </div>
      </div>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          disabled={DEMO_MODE}
          className={`${card} w-full py-3.5 text-center font-semibold text-red-600 disabled:text-slate-400`}
        >
          Sign out
        </button>
        {DEMO_MODE && (
          <p className="mt-2 text-center text-xs text-slate-500">Demo mode: no sign-in required.</p>
        )}
      </form>
    </main>
  );
}
