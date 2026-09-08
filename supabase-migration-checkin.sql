-- Usher check-in migration — run ONCE in Supabase SQL Editor.
-- Adds the minimum check-in fields to the EXISTING invitations table.
-- Does not touch RSVP flow, categories, or existing data.

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS check_in_status TEXT NOT NULL DEFAULT 'not_checked_in';

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ;

ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS checked_in_by TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_check_in_status_check') THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_check_in_status_check
      CHECK (check_in_status IN ('not_checked_in', 'checked_in'));
  END IF;
END
$$;

-- Fast lookups for usher search and live counts.
CREATE INDEX IF NOT EXISTS idx_invitations_checkin
  ON invitations(rsvp_category, check_in_status)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_invitations_guest_name
  ON invitations(guest_name);

-- NOTE: no RLS changes needed. All /check-in database access runs
-- server-side with the service-role key, which bypasses RLS.
-- The public anon policies are unchanged.
