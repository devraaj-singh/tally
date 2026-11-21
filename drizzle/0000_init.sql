CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "color" text,
  "emoji" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "amount_cents" integer NOT NULL,
  "category_id" uuid REFERENCES "categories"("id") ON DELETE RESTRICT,
  "note" text,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions" ("date");
CREATE INDEX IF NOT EXISTS "transactions_category_id_idx" ON "transactions" ("category_id");
