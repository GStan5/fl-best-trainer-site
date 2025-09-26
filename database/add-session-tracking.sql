-- Add weightlifting_classes_booked field to track booked but not yet completed sessions
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weightlifting_classes_booked INTEGER DEFAULT 0;

-- Update existing users to have 0 booked sessions
UPDATE users 
SET weightlifting_classes_booked = 0 
WHERE weightlifting_classes_booked IS NULL;

-- Add completed_at field to bookings table to track when classes are completed
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- Add a new status option for completed bookings (existing values: 'confirmed', 'cancelled')
-- The status field should now support 'confirmed', 'cancelled', 'completed'