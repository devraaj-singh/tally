const AMOUNT_RE = /^(\d+)(?:\.(\d{1,2}))?$/;
const MAX_CENTS = 2_147_483_647; // matches the integer column type

/**
 * Parse a user-entered amount ("12.34", "5", "0.5") into integer cents.
 * Rejects empty, zero, negative, non-numeric, >2 decimals, and overflow.
 */
export function parseAmountToCents(input: string): { cents: number } | { error: string } {
  const trimmed = input.trim();
  if (trimmed === "") return { error: "Amount is required" };

  const match = AMOUNT_RE.exec(trimmed);
  if (!match) return { error: "Enter a positive amount with at most 2 decimal places" };

  const whole = Number(match[1]);
  const fraction = match[2] ?? "";
  const cents = whole * 100 + Number(fraction.padEnd(2, "0"));

  if (cents === 0) return { error: "Amount must be greater than zero" };
  if (cents > MAX_CENTS) return { error: "Amount is too large" };
  return { cents };
}

/** Format integer cents as a two-decimal string: 1240 -> "12.40", 5 -> "0.05". */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}
