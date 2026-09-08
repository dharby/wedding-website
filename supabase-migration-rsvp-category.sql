-- RSVP categories migration — run ONCE in Supabase SQL Editor
-- (for databases created before the rsvp_category column existed)

-- 1. Add the category column to both tables
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS rsvp_category TEXT DEFAULT 'couple';
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS rsvp_category TEXT DEFAULT 'couple';

-- 2. Backfill any existing rows
UPDATE invitations SET rsvp_category = 'couple' WHERE rsvp_category IS NULL;
UPDATE rsvps SET rsvp_category = 'couple' WHERE rsvp_category IS NULL;

-- 3. Constrain values (only if the constraints don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_rsvp_category_check') THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_rsvp_category_check
      CHECK (rsvp_category IN ('grooms_parents', 'brides_parents', 'couple'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rsvps_rsvp_category_check') THEN
    ALTER TABLE rsvps ADD CONSTRAINT rsvps_rsvp_category_check
      CHECK (rsvp_category IN ('grooms_parents', 'brides_parents', 'couple'));
  END IF;
END
$$;

-- 4. Reference numbers now carry a list prefix for entrance sorting:
-- GP = Groom's Parents, BP = Bride's Parents, AT = The Couple
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference_number :=
    CASE NEW.rsvp_category
      WHEN 'grooms_parents' THEN 'GP-2026-'
      WHEN 'brides_parents' THEN 'BP-2026-'
      ELSE 'AT-2026-'
    END || upper(substring(md5(random()::text) from 1 for 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Allow the website to auto-create invitation rows on RSVP
DROP POLICY IF EXISTS "Anyone can insert invitations" ON invitations;
CREATE POLICY "Anyone can insert invitations" ON invitations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update RSVP status" ON invitations;
CREATE POLICY "Anyone can update RSVP status" ON invitations
  FOR UPDATE USING (is_active = true) WITH CHECK (is_active = true);
