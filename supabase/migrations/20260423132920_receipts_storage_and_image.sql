/*
  # Receipts image storage

  1. Changes
     - Create public storage bucket `receipts` for ticket images
     - Add `image_path` column to receipts table (nullable)
     - Add RLS policies on storage.objects for anon access to the `receipts` bucket
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'image_path'
  ) THEN
    ALTER TABLE receipts ADD COLUMN image_path text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts anon read'
  ) THEN
    CREATE POLICY "receipts anon read" ON storage.objects
      FOR SELECT TO anon USING (bucket_id = 'receipts');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts anon insert'
  ) THEN
    CREATE POLICY "receipts anon insert" ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'receipts');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts anon delete'
  ) THEN
    CREATE POLICY "receipts anon delete" ON storage.objects
      FOR DELETE TO anon USING (bucket_id = 'receipts');
  END IF;
END $$;
