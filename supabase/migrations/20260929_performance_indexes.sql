-- ════════════════════════════════════════════════════════════
-- Mujtaba Forex Trader — Supabase Performance Indexes
-- Apply via: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════

-- ── 1. Signals: indexed for status filter + recency sort ──
-- This powers the homepage signal fetch:
--   .eq("status","active").order("created_at", desc).limit(6)
CREATE INDEX IF NOT EXISTS idx_signals_status_created
  ON signals (status, created_at DESC);

-- ── 2. Enrollments: indexed for admin recency queries ──
CREATE INDEX IF NOT EXISTS idx_enrollments_created
  ON enrollments (created_at DESC);

-- ── 3. Contacts: indexed for admin queries ──
CREATE INDEX IF NOT EXISTS idx_contacts_created
  ON contacts (created_at DESC);

-- ════════════════════════════════════════════════════════════
-- Row Level Security — Harden all public-facing tables
-- ════════════════════════════════════════════════════════════

-- Enable RLS (idempotent)
ALTER TABLE signals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts    ENABLE ROW LEVEL SECURITY;

-- ── signals: public can only read ACTIVE signals ──
DROP POLICY IF EXISTS "Public read active signals" ON signals;
CREATE POLICY "Public read active signals" ON signals
  FOR SELECT
  USING (status = 'active');

-- ── enrollments: anon users can INSERT only ──
DROP POLICY IF EXISTS "Anon insert enrollment" ON enrollments;
CREATE POLICY "Anon insert enrollment" ON enrollments
  FOR INSERT
  WITH CHECK (true);

-- ── contacts: anon users can INSERT only ──
DROP POLICY IF EXISTS "Anon insert contact" ON contacts;
CREATE POLICY "Anon insert contact" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- Verify indexes created
-- ════════════════════════════════════════════════════════════
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('signals', 'enrollments', 'contacts')
ORDER BY tablename, indexname;
