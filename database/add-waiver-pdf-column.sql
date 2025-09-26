-- Migration to add waiver PDF storage column
-- Run this to add waiver PDF storage to the users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS waiver_pdf_data BYTEA,
ADD COLUMN IF NOT EXISTS waiver_pdf_filename VARCHAR(255);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_waiver_signed ON users(waiver_signed);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);