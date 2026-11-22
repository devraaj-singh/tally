import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmountToCents, formatCents } from "./money.ts";

test("parseAmountToCents accepts valid amounts", () => {
  assert.deepEqual(parseAmountToCents("12.34"), { cents: 1234 });
  assert.deepEqual(parseAmountToCents("5"), { cents: 500 });
  assert.deepEqual(parseAmountToCents("0.5"), { cents: 50 });
});

test("parseAmountToCents rejects invalid amounts", () => {
  for (const bad of ["0", "0.00", "-5", "abc", "1.234", "", "  "]) {
    const r = parseAmountToCents(bad);
    assert.ok("error" in r, `expected error for "${bad}"`);
  }
});

test("formatCents formats with two decimals", () => {
  assert.equal(formatCents(1240), "12.40");
  assert.equal(formatCents(5), "0.05");
});
