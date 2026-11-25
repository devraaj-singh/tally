"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  history: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  insights: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  categories: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  savings: <><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
};

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/insights", label: "Insights", icon: "insights" },
  { href: "/categories", label: "Categories", icon: "categories" },
  { href: "/savings", label: "Savings", icon: "savings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-accent-600" : "text-slate-400"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[t.icon]}
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
