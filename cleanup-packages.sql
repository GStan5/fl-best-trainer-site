-- Script to clean up packages - keep only the $400 weightlifting package

-- Delete all packages except the $400 one (10 sessions)
DELETE FROM packages 
WHERE price != 400.00 OR sessions_included != 10;

-- Show remaining packages
SELECT 
  id,
  name,
  description,
  sessions_included,
  price,
  duration_days,
  is_active
FROM packages
ORDER BY price DESC;