const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * Half-open date range [start, end) covering every calendar day in `month` ("YYYY-MM").
 * Pure string arithmetic on the date column's "YYYY-MM-DD" form, so no timezone shifting.
 */
export function monthRange(month: string): { start: string; end: string } {
  const match = MONTH_RE.exec(month);
  if (!match) throw new Error(`Invalid month "${month}", expected YYYY-MM`);

  const year = Number(match[1]);
  const mon = Number(match[2]);
  const nextYear = mon === 12 ? year + 1 : year;
  const nextMon = mon === 12 ? 1 : mon + 1;

  return {
    start: `${match[1]}-${match[2]}-01`,
    end: `${String(nextYear).padStart(4, "0")}-${String(nextMon).padStart(2, "0")}-01`,
  };
}
