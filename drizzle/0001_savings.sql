CREATE TABLE IF NOT EXISTS "savings_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "target_cents" integer NOT NULL,
  "emoji" text,
  "color" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "archived_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "savings_contributions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "goal_id" uuid NOT NULL REFERENCES "savings_goals"("id") ON DELETE CASCADE,
  "amount_cents" integer NOT NULL,
  "date" date NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "savings_contributions_goal_id_idx" ON "savings_contributions" ("goal_id");
