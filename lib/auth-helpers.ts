import { cookies } from "next/headers";
import { DEMO_MODE } from "./constants.ts";
import { SESSION_COOKIE, isValidSession } from "./auth.ts";

// Defense in depth: server actions re-check the session instead of trusting middleware alone.
export async function isAuthorized(): Promise<boolean> {
  if (DEMO_MODE) return true;
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE)?.value);
}
