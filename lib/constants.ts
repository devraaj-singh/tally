// "Production" = NODE_ENV=production or running on Vercel.
export const IS_PRODUCTION = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

// Demo mode (no DB, no password gate) is a local-dev-only convenience.
// It is NEVER enabled in production, even if DATABASE_URL is missing: fail closed.
export const DEMO_MODE = !process.env.DATABASE_URL && !IS_PRODUCTION;

/** Names of required production env vars that are missing (empty outside production). */
export function missingProductionEnv(): string[] {
  if (!IS_PRODUCTION) return [];
  return ["DATABASE_URL", "APP_PASSWORD", "AUTH_SECRET"].filter((k) => !process.env[k]);
}
