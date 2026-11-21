import { categories, transactions } from "./schema.ts";

const pad = (n: number) => String(n).padStart(2, "0");
function ymd(year: number, monthIndex: number, day: number) {
  const d = new Date(Date.UTC(year, monthIndex, day));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedDemo(db: any, now: Date = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();

  const cats = await db
    .insert(categories)
    .values([
      { name: "Groceries", color: "#22c55e", emoji: "🛒" },
      { name: "Dining", color: "#f97316", emoji: "🍜" },
      { name: "Transport", color: "#3b82f6", emoji: "🚌" },
      { name: "Entertainment", color: "#a855f7", emoji: "🎬" },
      { name: "Bills", color: "#ef4444", emoji: "💡" },
      { name: "Uncategorized", color: "#94a3b8", emoji: "📦" },
    ])
    .returning();
  const id = (name: string) => cats.find((c: { name: string }) => c.name === name)!.id as string;

  const sample: [number, number, string, string, number][] = [
    // [monthOffset, day, category, note, cents]
    [0, 1, "Bills", "Electricity", 8450],
    [0, 3, "Groceries", "Weekly shop", 6420],
    [0, 5, "Transport", "Metro pass", 3000],
    [0, 8, "Dining", "Dinner out", 4275],
    [0, 12, "Entertainment", "Movie tickets", 2400],
    [0, 15, "Groceries", "Farmers market", 3180],
    [-1, 2, "Bills", "Internet", 5999],
    [-1, 6, "Groceries", "Weekly shop", 7125],
    [-1, 10, "Dining", "Brunch", 3350],
    [-1, 14, "Transport", "Ride share", 1890],
    [-1, 20, "Entertainment", "Concert", 6500],
    [-1, 25, "Groceries", "Bulk stock-up", 9210],
  ];

  await db.insert(transactions).values(
    sample.map(([off, day, cat, note, cents]) => ({
      amountCents: cents,
      categoryId: id(cat),
      note,
      date: ymd(y, m + off, day),
    })),
  );
}
