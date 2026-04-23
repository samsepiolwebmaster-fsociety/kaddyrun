/*
  # Prevent duplicate items per device/store

  1. Changes
     - Add unique index on items(device_id, store, lower(name))
  2. Notes
     - Enforces idempotent seeding; prior duplicates already removed
*/

CREATE UNIQUE INDEX IF NOT EXISTS items_unique_device_store_name
  ON items (device_id, store, lower(name));
