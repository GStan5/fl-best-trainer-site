-- Migration to add fitness goals and medical conditions columns to users table
-- Run this to add the missing columns for complete user profile management

-- Add fitness goals and medical conditions columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fitness_goals TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.fitness_goals IS 'User fitness goals and objectives';
COMMENT ON COLUMN users.medical_conditions IS 'Medical conditions or limitations to be aware of during training';