/*
  # Add authentication, profiles, and per-user data scoping

  1. New Tables
     - `profiles` (user_id uuid PK → auth.users, username text, created_at)

  2. Changes
     - Add `user_id uuid` (nullable initially) to `items`, `receipts`, `receipt_items`
     - Create Sam's account `samsepiolwebmaster@gmail.com` in auth.users with bcrypt password
     - Assign all existing rows (items, receipts, receipt_items) to Sam's user_id
     - Set `user_id NOT NULL` once backfilled
     - Replace permissive anon policies with strict per-user authenticated policies
     - Update receipts storage policies to require authenticated users and path prefix == auth.uid()

  3. Security
     - Enable RLS on profiles
     - All tables now require auth.uid() = user_id
     - Storage objects in `receipts` bucket scoped to the uploader's user_id folder prefix
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles select own') THEN
    CREATE POLICY "profiles select own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles insert own') THEN
    CREATE POLICY "profiles insert own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles update own') THEN
    CREATE POLICY "profiles update own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE receipt_items ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
DECLARE
  sam_id uuid;
BEGIN
  SELECT id INTO sam_id FROM auth.users WHERE email = 'samsepiolwebmaster@gmail.com' LIMIT 1;
  IF sam_id IS NULL THEN
    sam_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      sam_id,
      'authenticated',
      'authenticated',
      'samsepiolwebmaster@gmail.com',
      crypt('A1234567', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"Sam & Maman"}'::jsonb,
      '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), sam_id, sam_id::text,
      jsonb_build_object('sub', sam_id::text, 'email', 'samsepiolwebmaster@gmail.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  END IF;

  INSERT INTO profiles (user_id, username)
  VALUES (sam_id, 'Sam & Maman')
  ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username;

  UPDATE items SET user_id = sam_id WHERE user_id IS NULL;
  UPDATE receipts SET user_id = sam_id WHERE user_id IS NULL;
  UPDATE receipt_items SET user_id = sam_id WHERE user_id IS NULL;
END $$;

ALTER TABLE items ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE receipts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE receipt_items ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS items_user_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS receipts_user_idx ON receipts(user_id);
CREATE INDEX IF NOT EXISTS receipt_items_user_idx ON receipt_items(user_id);

DROP POLICY IF EXISTS "anon select items" ON items;
DROP POLICY IF EXISTS "anon insert items" ON items;
DROP POLICY IF EXISTS "anon update items" ON items;
DROP POLICY IF EXISTS "anon delete items" ON items;

DROP POLICY IF EXISTS "anon select receipts" ON receipts;
DROP POLICY IF EXISTS "anon insert receipts" ON receipts;
DROP POLICY IF EXISTS "anon update receipts" ON receipts;
DROP POLICY IF EXISTS "anon delete receipts" ON receipts;

DROP POLICY IF EXISTS "anon select receipt_items" ON receipt_items;
DROP POLICY IF EXISTS "anon insert receipt_items" ON receipt_items;
DROP POLICY IF EXISTS "anon update receipt_items" ON receipt_items;
DROP POLICY IF EXISTS "anon delete receipt_items" ON receipt_items;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='items' AND policyname='items select own') THEN
    CREATE POLICY "items select own" ON items FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='items' AND policyname='items insert own') THEN
    CREATE POLICY "items insert own" ON items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='items' AND policyname='items update own') THEN
    CREATE POLICY "items update own" ON items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='items' AND policyname='items delete own') THEN
    CREATE POLICY "items delete own" ON items FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipts' AND policyname='receipts select own') THEN
    CREATE POLICY "receipts select own" ON receipts FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipts' AND policyname='receipts insert own') THEN
    CREATE POLICY "receipts insert own" ON receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipts' AND policyname='receipts update own') THEN
    CREATE POLICY "receipts update own" ON receipts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipts' AND policyname='receipts delete own') THEN
    CREATE POLICY "receipts delete own" ON receipts FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipt_items' AND policyname='receipt_items select own') THEN
    CREATE POLICY "receipt_items select own" ON receipt_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipt_items' AND policyname='receipt_items insert own') THEN
    CREATE POLICY "receipt_items insert own" ON receipt_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipt_items' AND policyname='receipt_items update own') THEN
    CREATE POLICY "receipt_items update own" ON receipt_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='receipt_items' AND policyname='receipt_items delete own') THEN
    CREATE POLICY "receipt_items delete own" ON receipt_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "receipts anon read" ON storage.objects;
DROP POLICY IF EXISTS "receipts anon insert" ON storage.objects;
DROP POLICY IF EXISTS "receipts anon delete" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts owner read') THEN
    CREATE POLICY "receipts owner read" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'receipts' AND split_part(name, '/', 1) = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts owner insert') THEN
    CREATE POLICY "receipts owner insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'receipts' AND split_part(name, '/', 1) = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='receipts owner delete') THEN
    CREATE POLICY "receipts owner delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'receipts' AND split_part(name, '/', 1) = auth.uid()::text);
  END IF;
END $$;
