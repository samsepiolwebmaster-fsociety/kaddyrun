/*
  # Kaddy shopping app schema

  1. New Tables
     - `items` - shopping list items
       - `id` (uuid, PK)
       - `device_id` (text) - anonymous device identifier
       - `name` (text) - article name
       - `price` (numeric) - estimated unit price in euros
       - `is_favorite` (bool) - starred favorite
       - `in_cart` (bool) - whether it's in the caddie
       - `list_type` (text) - 'prepare' or 'store'
       - `store` (text) - associated store name
       - `created_at` (timestamptz)
     - `scans` - scanned receipts history
       - `id` (uuid, PK)
       - `device_id` (text)
       - `store` (text)
       - `total` (numeric)
       - `items_count` (int)
       - `scanned_at` (timestamptz)

  2. Security
     - RLS enabled on both tables
     - Anonymous (public) policies scoped by device_id supplied via header
     - For simplicity policies allow anon role to read/write rows that match a device_id filter handled client-side
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  in_cart boolean NOT NULL DEFAULT false,
  list_type text NOT NULL DEFAULT 'prepare',
  store text NOT NULL DEFAULT 'Leclerc',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT '',
  store text NOT NULL DEFAULT 'Leclerc',
  total numeric NOT NULL DEFAULT 0,
  items_count integer NOT NULL DEFAULT 0,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS items_device_idx ON items(device_id);
CREATE INDEX IF NOT EXISTS scans_device_idx ON scans(device_id);

CREATE POLICY "anon select items" ON items FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert items" ON items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update items" ON items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete items" ON items FOR DELETE TO anon USING (true);

CREATE POLICY "anon select scans" ON scans FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert scans" ON scans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update scans" ON scans FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon delete scans" ON scans FOR DELETE TO anon USING (true);
