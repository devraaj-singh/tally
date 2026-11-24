import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  verifyPassword,
  createSessionCookieValue,
  isValidSession,
} from "./auth.ts";

const PASSWORD = "correct horse battery";
const SECRET = "test-auth-secret-0123456789";

const saved = { APP_PASSWORD: process.env.APP_PASSWORD, AUTH_SECRET: process.env.AUTH_SECRET };

beforeEach(() => {
  process.env.APP_PASSWORD = PASSWORD;
  process.env.AUTH_SECRET = SECRET;
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

test("isValidSession accepts a value produced by createSessionCookieValue", async () => {
  const cookie = await createSessionCookieValue();
  assert.equal(await isValidSession(cookie), true);
});

test("isValidSession rejects empty and missing values", async () => {
  assert.equal(await isValidSession(""), false);
  assert.equal(await isValidSession(undefined), false);
});

test("isValidSession rejects garbage", async () => {
  assert.equal(await isValidSession("garbage.sig"), false);
  assert.equal(await isValidSession("garbage"), false);
  assert.equal(await isValidSession("a.b.c"), false);
});

test("isValidSession rejects a value signed with a different secret", async () => {
  process.env.AUTH_SECRET = "some-other-secret";
  const foreign = await createSessionCookieValue();
  process.env.AUTH_SECRET = SECRET;
  assert.equal(await isValidSession(foreign), false);
});

test("isValidSession rejects a tampered payload", async () => {
  const cookie = await createSessionCookieValue();
  const [, sig] = cookie.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ exp: Date.now() + 1e12 })).toString("base64url");
  assert.equal(await isValidSession(`${forgedPayload}.${sig}`), false);
});

test("isValidSession rejects an expired session", async () => {
  const realNow = Date.now;
  Date.now = () => realNow() - 31 * 24 * 60 * 60 * 1000;
  let cookie: string;
  try {
    cookie = await createSessionCookieValue();
  } finally {
    Date.now = realNow;
  }
  assert.equal(await isValidSession(cookie), false);
});

test("isValidSession fails closed when AUTH_SECRET is unset", async () => {
  const cookie = await createSessionCookieValue();
  delete process.env.AUTH_SECRET;
  assert.equal(await isValidSession(cookie), false);
});

test("createSessionCookieValue throws when AUTH_SECRET is unset", async () => {
  delete process.env.AUTH_SECRET;
  await assert.rejects(createSessionCookieValue());
});

test("verifyPassword matches only the correct APP_PASSWORD", () => {
  assert.equal(verifyPassword(PASSWORD), true);
  for (const bad of ["", "wrong", PASSWORD + " ", PASSWORD.toUpperCase(), PASSWORD.slice(1)]) {
    assert.equal(verifyPassword(bad), false, `expected false for "${bad}"`);
  }
});

test("verifyPassword rejects everything when APP_PASSWORD is unset", () => {
  delete process.env.APP_PASSWORD;
  assert.equal(verifyPassword(""), false);
  assert.equal(verifyPassword("anything"), false);
});
