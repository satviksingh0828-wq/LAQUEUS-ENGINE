/*
  # Laqueus Engine Database Schema

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key_name` (text) - friendly name for the key
      - `api_key` (text) - the actual OpenRouter API key
      - `priority` (integer) - order for fallback (lower = higher priority)
      - `is_active` (boolean) - whether this key is active
      - `created_at` (timestamptz)
    
    - `models`
      - `id` (uuid, primary key)
      - `model_name` (text) - OpenRouter model identifier
      - `display_name` (text) - friendly display name
      - `priority` (integer) - order for fallback
      - `is_active` (boolean) - whether this model is active
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public access for reading (no auth system, PIN-based only)
    - Public access for writing (PIN validation handled in app logic)
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key text NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  display_name text NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view api keys"
  ON api_keys FOR SELECT
  USING (true);

CREATE POLICY "Public can insert api keys"
  ON api_keys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update api keys"
  ON api_keys FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete api keys"
  ON api_keys FOR DELETE
  USING (true);

CREATE POLICY "Public can view models"
  ON models FOR SELECT
  USING (true);

CREATE POLICY "Public can insert models"
  ON models FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update models"
  ON models FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete models"
  ON models FOR DELETE
  USING (true);