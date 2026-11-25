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

1. Create a Neon project and copy its connection string (`DATABASE_URL`).
2. Run the migration against it from your machine: `DATABASE_URL="<neon url>" npm run db:migrate`.
3. Push the repo to GitHub, then in Vercel choose **Add New > Project** and import it
   (framework preset: Next.js; defaults are fine).
4. In **Project Settings > Environment Variables** set, for Production:
   - `DATABASE_URL` - the Neon connection string
   - `APP_PASSWORD` - the password for the login gate
   - `AUTH_SECRET` - a long random string (e.g. `openssl rand -base64 32`)
5. Deploy (or redeploy after setting the variables).
6. Open the live URL on your phone and log in. Install it:
   - iOS Safari: Share > Add to Home Screen
   - Android Chrome: menu > Install app
7. Add a real transaction to confirm the database works end to end.

The PWA manifest is served at `/manifest.webmanifest`; icons are generated at build/request
time by `next/og` (`app/icon.tsx`, `app/apple-icon.tsx`, `app/icons/*`).
