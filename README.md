# Tally

A lean spending tracker built with Next.js 16 (App Router), TypeScript and Tailwind CSS v4.

## Run

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start
```

## Environment

Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`, `APP_PASSWORD`, `AUTH_SECRET`.

## Windows/WSL toolchain notes

Node is Windows-only under WSL: `npm`/`npx` are Windows shims. Use `npm install --legacy-peer-deps`.
`next dev` runs as a Windows process, so WSL `curl localhost:3000` will not reach it; use
`powershell.exe -NoProfile -Command "Invoke-WebRequest http://localhost:3000 -UseBasicParsing"`.
Stop stray servers with `taskkill.exe /F /IM node.exe /T`.

## Database migration

`npm run db:migrate` applies `drizzle/0000_init.sql` (idempotent: `IF NOT EXISTS`) to the
database in `DATABASE_URL`, using `@neondatabase/serverless`. No drizzle-kit needed.

```bash
# from a shell with DATABASE_URL set (use the Neon *pooled or direct* connection string)
DATABASE_URL="postgres://..." npm run db:migrate
# or load it from a file
node --env-file=.env.local scripts/migrate.mjs
```

It prints `db:migrate OK` on success, or `db:migrate failed: ...` and exits non-zero.

## Deploy (Vercel + Neon)

1. Create a Neon Postgres database and copy its connection string.
2. Apply the schema (idempotent, safe to re-run):
   ```bash
   DATABASE_URL="postgres://..." npm run db:migrate
   # or: node --env-file=.env.local scripts/migrate.mjs
   ```
3. Push the repo to GitHub and import it in Vercel (framework: Next.js).
   Install command: `npm install --legacy-peer-deps`.
4. In Vercel project settings, set environment variables:
   - `DATABASE_URL`: the Neon connection string
   - `APP_PASSWORD`: the single-user login password
   - `AUTH_SECRET`: random string, e.g. `openssl rand -base64 32`
5. Deploy, open the URL on your phone, log in, and add a transaction.
6. Install: Android Chrome "Install app"; iOS Safari Share > "Add to Home Screen".

Icons are generated at build time by `next/og` (`app/icon.tsx`, `app/apple-icon.tsx`,
`app/icons/*`); there are no binary image assets.
