import { cookies } from "next/headers";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** The user's local day (from the tally_today cookie), falling back to the server's date. */
export async function getActiveToday(): Promise<string> {
  const v = (await cookies()).get("tally_today")?.value;
  if (v && DAY.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))) return v;
  return new Date().toISOString().slice(0, 10);
}

/** `explicit` if a valid YYYY-MM, else the user's current local month. */
export async function getActiveMonth(explicit?: string): Promise<string> {
  if (explicit && MONTH.test(explicit)) return explicit;
  return (await getActiveToday()).slice(0, 7);
}
