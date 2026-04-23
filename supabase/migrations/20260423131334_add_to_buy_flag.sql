/*
  # Add to_buy flag to items

  1. Changes
     - Add `to_buy` boolean column to items table (default false)
       - Marks whether the item is selected to be bought on the next shopping trip
       - `in_cart` retains its meaning: item has been taken at the store
  2. Notes
     - Non-destructive: column only added if missing, default false, no data loss
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'to_buy'
  ) THEN
    ALTER TABLE items ADD COLUMN to_buy boolean NOT NULL DEFAULT false;
  END IF;
END $$;
