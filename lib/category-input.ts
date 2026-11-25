export const CATEGORY_COLORS = [
  "#059669", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899",
  "#ef4444", "#f97316", "#eab308", "#14b8a6", "#64748b",
];
export const CATEGORY_EMOJIS = [
  "🛒", "🍔", "☕", "🚗", "🏠", "💡", "🎬", "🏥", "👕", "✈️",
  "🎁", "📚", "💪", "🐶", "📱", "💼",
];

const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_NAME = 40;

/** Validate/normalise category form input. */
export function parseCategoryInput(raw: {
  name: string;
  emoji: string;
  color: string;
}): { name: string; emoji: string | null; color: string | null } | { error: string } {
  const name = raw.name.trim();
  if (name === "") return { error: "Enter a category name" };
  if (name.length > MAX_NAME) return { error: `Name must be ${MAX_NAME} characters or fewer` };
  const color = raw.color.trim();
  if (color !== "" && !HEX.test(color)) return { error: "Pick a valid color" };
  const emoji = raw.emoji.trim();
  if (emoji.length > 16) return { error: "Pick a single emoji" };
  return { name, emoji: emoji || null, color: color || null };
}
