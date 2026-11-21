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

## Deploy

Deploy to Vercel with a Neon Postgres database; set the three env vars in the project settings.
