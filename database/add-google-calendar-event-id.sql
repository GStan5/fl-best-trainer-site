-- Add Google Calendar integration column to bookings table
-- This migration adds support for storing Google Calendar event IDs

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255);

-- Add index for better performance when querying calendar events
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_id ON bookings(google_calendar_event_id);