"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "../../../lib/auth.ts";
import { DEMO_MODE } from "../../../lib/constants.ts";

export async function signOut(): Promise<void> {
  // Demo mode has no real session to clear.
  if (DEMO_MODE) redirect("/");
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
  redirect("/login");
}
