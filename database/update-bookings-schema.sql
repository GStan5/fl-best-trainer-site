-- Migration to make user_package_id optional in bookings table
-- This allows for bookings using the new direct counter system

ALTER TABLE bookings 
ALTER COLUMN user_package_id DROP NOT NULL;