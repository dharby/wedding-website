-- Wedding Website Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kudqbturdcsmmnigkopt/sql/new

-- ============================================
-- Drop existing policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Public can view active invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can update RSVP status" ON invitations;
DROP POLICY IF EXISTS "Anyone can insert RSVPs" ON rsvps;
DROP POLICY IF EXISTS "Anyone can insert gift confirmations" ON gift_confirmations;
DROP POLICY IF EXISTS "Service role full access on invitations" ON invitations;
DROP POLICY IF EXISTS "Service role full access on rsvps" ON rsvps;
DROP POLICY IF EXISTS "Service role full access on gift_confirmations" ON gift_confirmations;

-- ============================================
-- TABLE 1: invitations
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_token TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_contact TEXT,
  allowed_guests INTEGER DEFAULT 1,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
  rsvp_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- TABLE 2: rsvps
-- ============================================
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_contact TEXT,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
  guest_count INTEGER DEFAULT 1,
  meal_preference TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- TABLE 3: gift_confirmations
-- ============================================
CREATE TABLE IF NOT EXISTS gift_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_contact TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_active ON invitations(is_active);
CREATE INDEX IF NOT EXISTS idx_rsvps_reference ON rsvps(reference_number);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_gifts_invitation ON gift_confirmations(invitation_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active invitations" ON invitations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can update RSVP status" ON invitations
  FOR UPDATE USING (is_active = true) WITH CHECK (is_active = true);

CREATE POLICY "Anyone can insert RSVPs" ON rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert gift confirmations" ON gift_confirmations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access on invitations" ON invitations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rsvps" ON rsvps
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on gift_confirmations" ON gift_confirmations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTION to generate reference numbers
-- ============================================
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference_number := 'AT-2026-' || upper(substring(md5(random()::text) from 1 for 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS set_reference_number ON rsvps;
CREATE TRIGGER set_reference_number
  BEFORE INSERT ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION generate_reference_number();

-- ============================================
-- SAMPLE DATA (optional - for testing)
-- ============================================
INSERT INTO invitations (invitation_token, guest_name, guest_contact, allowed_guests, rsvp_status, is_active)
VALUES
  ('tok_abc123def456', 'Adaeze Okonkwo', 'adaeze@email.com', 1, 'pending', true),
  ('tok_xyz789ghi012', 'Emeka Nwankwo', 'emeka@email.com', 1, 'pending', true),
  ('tok_pqr345stu678', 'Fatima Abubakar', 'fatima@email.com', 1, 'pending', true)
ON CONFLICT (invitation_token) DO NOTHING;