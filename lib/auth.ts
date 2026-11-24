// Shared-password gate for the single-user app.
//
// Runs on BOTH Edge (middleware.ts) and Node (server actions, tests), so this
// module must only use Web APIs (globalThis.crypto.subtle, TextEncoder, atob/btoa).
// Do NOT import node:crypto or Buffer here.

export const SESSION_COOKIE = "tally_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const SESSION_TTL_MS = SESSION_MAX_AGE_SECONDS * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function authSecret(): string | undefined {
  const s = process.env.AUTH_SECRET;
  return s && s.length > 0 ? s : undefined;
}

/** True only when both APP_PASSWORD and AUTH_SECRET are configured. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD) && authSecret() !== undefined;
}

/**
 * Constant-time comparison of the input against APP_PASSWORD.
 * Fails closed (returns false) when APP_PASSWORD is unset or empty.
 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  const a = encoder.encode(input);
  const b = encoder.encode(expected);
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string, usage: "sign" | "verify"): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

/**
 * Creates a session cookie value of the form `<base64url(payload)>.<base64url(hmac)>`.
 * The payload is JSON `{ "exp": <epoch ms> }`. Throws if AUTH_SECRET is unset.
 */
export async function createSessionCookieValue(): Promise<string> {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not set");
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })));
  const key = await hmacKey(secret, "sign");
  const signature = new Uint8Array(
    await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
  );
  return `${payload}.${toBase64Url(signature)}`;
}

/**
 * True only for a cookie value minted by createSessionCookieValue() under the
 * current AUTH_SECRET and not yet expired. Fails closed on any malformed input.
 */
export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const secret = authSecret();
  if (!secret || !cookieValue) return false;

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [payload, signaturePart] = parts;

  const signature = fromBase64Url(signaturePart);
  if (!signature) return false;

  const key = await hmacKey(secret, "verify");
  const valid = await globalThis.crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(payload),
  );
  if (!valid) return false;

  const body = fromBase64Url(payload);
  if (!body) return false;

  let data: unknown;
  try {
    data = JSON.parse(decoder.decode(body));
  } catch {
    return false;
  }
  if (typeof data !== "object" || data === null) return false;
  const exp = (data as { exp?: unknown }).exp;
  return typeof exp === "number" && exp > Date.now();
}
