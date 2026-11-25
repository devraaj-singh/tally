"use client";

import { useEffect } from "react";

/** Writes the user's local day to a cookie so the server can compute "today"/"this month" locally. */
export default function ClientDateSync() {
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    document.cookie = `tally_today=${today}; path=/; max-age=86400; SameSite=Lax`;
  }, []);
  return null;
}
