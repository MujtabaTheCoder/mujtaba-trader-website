/*
# Create core tables: enrollments, contacts, signals

This migration sets up the three tables the Mujtaba Forex Trader site depends on.
The public site has NO sign-in screen — the admin panel uses a hardcoded JS password
check only — so all policies are scoped to `anon, authenticated` (single-tenant, public).

1. New Tables
- `enrollments`: candidate applications submitted from the enroll form and home page.
  - id (uuid PK), name, phone, email, city, age, occupation, level, course,
    goal, source, status (New/Contacted/Enrolled), created_at.
- `contacts`: general inquiries submitted from the contact page.
  - id (uuid PK), name, phone, email, subject, message, created_at.
- `signals`: institutional trading signals broadcast from the admin panel and
  displayed on the home page and signals page.
  - id (uuid PK), pair, type (BUY/SELL), entry_price, stop_loss,
    take_profit_1, take_profit_2, notes, pips, status, created_at.

2. Security
- RLS enabled on all three tables.
- 4 CRUD policies each (select/insert/update/delete) scoped to `anon, authenticated`
  because the frontend talks to Supabase with the anon key and there is no auth flow.
*/

-- ═══════════════ enrollments ═══════════════
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text,
  age text,
  occupation text,
  level text,
  course text,
  goal text,
  source text,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_enrollments" ON enrollments;
CREATE POLICY "anon_select_enrollments" ON enrollments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_enrollments" ON enrollments;
CREATE POLICY "anon_insert_enrollments" ON enrollments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_enrollments" ON enrollments;
CREATE POLICY "anon_update_enrollments" ON enrollments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_enrollments" ON enrollments;
CREATE POLICY "anon_delete_enrollments" ON enrollments FOR DELETE
  TO anon, authenticated USING (true);

-- ═══════════════ contacts ═══════════════
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  subject text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE
  TO anon, authenticated USING (true);

-- ═══════════════ signals ═══════════════
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL DEFAULT 'XAU/USD',
  type text NOT NULL DEFAULT 'BUY',
  entry_price text,
  stop_loss text,
  take_profit_1 text,
  take_profit_2 text,
  notes text,
  pips text,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signals" ON signals;
CREATE POLICY "anon_select_signals" ON signals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signals" ON signals;
CREATE POLICY "anon_insert_signals" ON signals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signals" ON signals;
CREATE POLICY "anon_update_signals" ON signals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signals" ON signals;
CREATE POLICY "anon_delete_signals" ON signals FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for faster ordering / filtering
CREATE INDEX IF NOT EXISTS enrollments_created_at_idx ON enrollments (created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS signals_created_at_idx ON signals (created_at DESC);
