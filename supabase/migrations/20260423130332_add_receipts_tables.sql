/*
  # Add detailed receipts storage

  1. New Tables
     - `receipts` - each scanned/entered receipt header
       - `id` (uuid, PK)
       - `device_id` (text)
       - `store` (text) - store name (e.g. "E.Leclerc")
       - `store_address` (text)
       - `ticket_number` (text)
       - `cashier` (text)
       - `total` (numeric)
       - `items_count` (int)
       - `purchased_at` (timestamptz)
       - `created_at` (timestamptz)
     - `receipt_items` - individual line items on a receipt
       - `id` (uuid, PK)
       - `receipt_id` (uuid, FK to receipts)
       - `name` (text)
       - `quantity` (numeric) - count (1, 2...) or weight
       - `unit` (text) - 'unit' or 'kg'
       - `unit_price` (numeric) - price per unit/kg
       - `total_price` (numeric) - line total
       - `tva_code` (text)
       - `position` (int) - display order

  2. Security
     - RLS enabled
     - Anonymous policies (app has no auth, scoping handled client-side via device_id)
*/

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT '',
  store text NOT NULL DEFAULT '',
  store_address text NOT NULL DEFAULT '',
  ticket_number text NOT NULL DEFAULT '',
  cashier text NOT NULL DEFAULT '',
  total numeric NOT NULL DEFAULT 0,
  items_count integer NOT NULL DEFAULT 0,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'unit',
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  tva_code text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS receipts_device_idx ON receipts(device_id);
CREATE INDEX IF NOT EXISTS receipt_items_receipt_idx ON receipt_items(receipt_id);

CREATE POLICY "anon select receipts" ON receipts FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert receipts" ON receipts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update receipts" ON receipts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete receipts" ON receipts FOR DELETE TO anon USING (true);

CREATE POLICY "anon select receipt_items" ON receipt_items FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert receipt_items" ON receipt_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update receipt_items" ON receipt_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete receipt_items" ON receipt_items FOR DELETE TO anon USING (true);
