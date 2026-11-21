# Spend Tracker — Design (v1)

**Working name:** "Tally" (easy to change — tell me if you want something else)
**Date:** 2026-11-22
**For:** Devraaj (single user), replacing the deleted BudgetWise/Cash-Counter.

## Intent & why
A lean, good-looking spending tracker you can open on your phone to log what you
spent in a few seconds and instantly see where your money is going, by category.
The old app grew into "too much app" (login, budgets, goals, charts). This one
strips back to the core and spends its effort on feeling fast and looking nice.

## Goals
- **Fast expense entry** — amount → category → done, in ~5 seconds, thumb-friendly.
- **Separate categories** you fully control (create / rename / recolor / delete).
- **Clear overview** — this month's total + a clean animated breakdown by category + recent activity.
- **Looks and feels nice** — good typography, smooth, tasteful animations.
- **Deploy to Vercel, open on phone via URL, installable to home screen.**
- **Data safe in the cloud**, syncs across phone and laptop.

## Non-goals (v1 — deliberately left out to stay lean)
- Budgets / spending limits per category (easy to add later; structured for it).
- Savings goals, income tracking, net worth, bank/card sync.
- Email or push notifications.
- Multi-user / sharing.

## Anti-goals (would make this a failure even if it works)
- Feeling heavy or slow to add an expense.
- Looking like a generic bootstrapped template.
- Losing your data.

## Constraints
- Runs on your Windows-side Node toolchain under WSL (see existing setup notes).
- Free tier only — no monthly cost at single-user scale.
- Cloud-hosted + public URL → needs a light privacy gate (see below).

## Approaches considered
1. **Cloud DB (CHOSEN by you):** Next.js on Vercel + free Neon Postgres. Data safe,
   syncs across devices, survives clearing the browser. Small one-time DB setup.
2. *Phone-only (localStorage):* leanest, zero backend, but data lives on one device
   and is easily lost. Rejected — too risky for months of spending data.
3. *Local-first + manual export:* no server but you manage backups by hand. Rejected —
   more fiddly for you than a free cloud DB that just syncs.

## How it gets built (my technical calls — correct any you don't like)
- **Framework:** Next.js 16 (App Router + Server Actions) — deploys to Vercel cleanly, you know it.
- **Database:** Neon Postgres via serverless HTTP driver + Drizzle ORM. One free DB.
- **Styling:** Tailwind CSS.
- **Animations:** Framer Motion — page transitions, list items sliding in, numbers
  counting up, the category chart animating on load.
- **Fonts (Google Fonts via `next/font`, Arial as fallback):** a clean UI font
  (**Inter**) for everything, plus a slightly characterful display font
  (**Sora** or **Space Grotesk**) for headings and the big balance number.
  → *If you'd rather just use plain Arial throughout, say so.*
- **Privacy gate:** one simple shared password (stored as an env var, kept in a cookie)
  so a random person with the URL can't see your spending. No accounts, no signup.
- **Build help:** I'll use your subagents — a backend agent for the DB/schema/server
  actions, and the frontend-design skill for the look & animations.

## What the app has (screens)
- **Home / Overview:** big "spent this month" number, animated donut or bar breakdown
  by category, list of recent expenses. Floating **+** button to add.
- **Add expense:** amount keypad, pick category (colored chips), date (defaults today),
  optional note. Fast.
- **Transactions:** full list, filter by month & category, tap to edit/delete.
- **Categories:** manage your categories (name, color, emoji).
- **Settings:** set/change the password, month view, data export (nice-to-have).

### Rough look (text sketch)
```
┌─────────────────────────────┐
│  November              ⚙︎   │
│                             │
│   Spent this month          │
│   $1,240.50   ▲ counts up   │
│                             │
│     ( animated donut )      │
│   🍔 Food        $420       │
│   🚗 Transport   $180       │
│   🛒 Groceries   $310       │
│                             │
│   Recent                    │
│   🍔 Lunch        -$14  Fri │
│   🛒 Target       -$62  Thu │
│                        (+)  │
└─────────────────────────────┘
```

## Left to the builder
- Exact color palette & which display font (Sora vs Space Grotesk) — I'll pick a
  tasteful default; you can react to it.
- Donut vs horizontal bars for the breakdown — I'll prototype one.
- Minor layout/spacing details.
