"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionCookieValue,
  isAuthConfigured,
  verifyPassword,
} from "../../lib/auth.ts";

// Shape required by React's useActionState: (previousState, formData).
// Returns an error string on failure; never throws for bad credentials.
export async function signIn(_prev: string | null, formData: FormData): Promise<string | null> {
  if (!isAuthConfigured()) {
    return "Sign-in is not configured on this server.";
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !verifyPassword(password)) {
    // Small fixed delay to slow down brute-force guessing on the public URL.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return "Incorrect password.";
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // redirect() throws NEXT_REDIRECT internally, so it must stay outside any try/catch.
  redirect("/");
}
