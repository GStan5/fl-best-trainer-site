-- Remove unique constraint to allow multiple bookings for same class
-- This allows users to book multiple spots for family/friends

-- Drop the unique constraint on bookings table
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_class_id_key;

-- Note: This change allows users to book the same class multiple times
-- which is useful for bringing family members or friends