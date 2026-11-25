import { test } from "node:test";
import assert from "node:assert/strict";

async function load(env: Record<string, string | undefined>) {
  const keys = ["NODE_ENV", "VERCEL", "DATABASE_URL", "APP_PASSWORD", "AUTH_SECRET"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, env);
  try {
    return await import(`./constants.ts?${Math.random()}`);
  } finally {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test("DEMO_MODE is on in dev without DATABASE_URL", async () => {
  const m = await load({ NODE_ENV: "development" });
  assert.equal(m.DEMO_MODE, true);
});

test("DEMO_MODE is off in production even without DATABASE_URL", async () => {
  const m = await load({ NODE_ENV: "production" });
  assert.equal(m.DEMO_MODE, false);
  assert.deepEqual(m.missingProductionEnv(), ["DATABASE_URL", "APP_PASSWORD", "AUTH_SECRET"]);
});

test("DEMO_MODE is off on Vercel even without DATABASE_URL", async () => {
  const m = await load({ NODE_ENV: "development", VERCEL: "1" });
  assert.equal(m.DEMO_MODE, false);
});
