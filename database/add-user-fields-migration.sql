-- Migration to add additional user fields for onboarding
-- Run this to update your existing database

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS waiver_signed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS waiver_ip_address INET,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

-- Update existing users to split name into first_name and last_name if needed
-- This will run only if the columns are empty
UPDATE users 
SET 
    first_name = CASE 
        WHEN first_name IS NULL AND name IS NOT NULL THEN 
            SPLIT_PART(name, ' ', 1)
        ELSE first_name 
    END,
    last_name = CASE 
        WHEN last_name IS NULL AND name IS NOT NULL AND POSITION(' ' IN name) > 0 THEN 
            SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE last_name 
    END
WHERE first_name IS NULL OR last_name IS NULL;