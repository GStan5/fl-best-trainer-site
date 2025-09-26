-- Migration to add package type counters for different service types
-- Run this to add weightlifting class and personal training session counters

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weightlifting_classes_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS personal_training_sessions_remaining INTEGER DEFAULT 0;

-- Add indexes for better performance on package lookups
CREATE INDEX IF NOT EXISTS idx_users_weightlifting_classes ON users(weightlifting_classes_remaining);
CREATE INDEX IF NOT EXISTS idx_users_personal_training_sessions ON users(personal_training_sessions_remaining);

-- Update any existing users to have 0 for both if they're NULL
UPDATE users 
SET 
    weightlifting_classes_remaining = COALESCE(weightlifting_classes_remaining, 0),
    personal_training_sessions_remaining = COALESCE(personal_training_sessions_remaining, 0)
WHERE weightlifting_classes_remaining IS NULL OR personal_training_sessions_remaining IS NULL;