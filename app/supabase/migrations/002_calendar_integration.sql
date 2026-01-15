-- Add calendar_event_id to showings table for Google Calendar integration
ALTER TABLE showings ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
ALTER TABLE showings ADD COLUMN IF NOT EXISTS external_id TEXT; -- ShowingTime appointment ID

-- Add index for external lookups
CREATE INDEX IF NOT EXISTS idx_showings_external_id ON showings(external_id);
CREATE INDEX IF NOT EXISTS idx_showings_calendar_event_id ON showings(calendar_event_id);
