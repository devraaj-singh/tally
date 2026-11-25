"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "tally_today";

function readCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
}

/** Keeps the user's local day in a cookie so the server computes "today"/"this month" locally. */
export default function ClientDateSync() {
  const router = useRouter();
  useEffect(() => {
    const sync = () => {
      const today = new Date().toLocaleDateString("en-CA");
      if (readCookie() === today) return; // unchanged: no refresh, no loop
      document.cookie = `${COOKIE}=${today}; path=/; max-age=86400; SameSite=Lax`;
      router.refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    sync();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);
  return null;
}
