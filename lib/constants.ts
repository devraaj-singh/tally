// "Production" = NODE_ENV=production or running on Vercel.
export const IS_PRODUCTION = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

// Demo mode (no DB, no password gate) is a local-dev-only convenience.
// It is NEVER enabled in production, even if DATABASE_URL is missing: fail closed.
// Set TALLY_FORCE_AUTH=1 in local dev to turn the password gate ON while still
// using the embedded PGlite demo DB — lets you see/test the real /login screen.
export const DEMO_MODE =
  !process.env.DATABASE_URL && !IS_PRODUCTION && !process.env.TALLY_FORCE_AUTH;

/** Names of required production env vars that are missing (empty outside production). */
export function missingProductionEnv(): string[] {
  if (!IS_PRODUCTION) return [];
  return ["DATABASE_URL", "APP_PASSWORD", "AUTH_SECRET"].filter((k) => !process.env[k]);
}
