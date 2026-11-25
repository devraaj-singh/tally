import test from "node:test";
import assert from "node:assert/strict";
import { parseCategoryInput } from "./category-input.ts";

test("trims and normalises", () => {
  assert.deepEqual(parseCategoryInput({ name: " Food ", emoji: "🍔", color: "#ef4444" }), {
    name: "Food", emoji: "🍔", color: "#ef4444",
  });
  assert.deepEqual(parseCategoryInput({ name: "X", emoji: "", color: "" }), {
    name: "X", emoji: null, color: null,
  });
});
test("rejects bad input", () => {
  assert.ok("error" in parseCategoryInput({ name: "  ", emoji: "", color: "" }));
  assert.ok("error" in parseCategoryInput({ name: "a".repeat(41), emoji: "", color: "" }));
  assert.ok("error" in parseCategoryInput({ name: "a", emoji: "", color: "red" }));
});
