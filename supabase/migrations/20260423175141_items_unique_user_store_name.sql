/*
  # Enforce item uniqueness per user/store

  1. Changes
     - Add unique index on items(user_id, store, lower(name)) where user_id is not null
  2. Notes
     - Prevents future duplicates now that auth is in place
     - Existing duplicates were cleaned up before this migration
*/

CREATE UNIQUE INDEX IF NOT EXISTS items_unique_user_store_name
  ON items (user_id, store, lower(name))
  WHERE user_id IS NOT NULL;
