// Test script to check waiver database updates
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function testWaiverStatus() {
  try {
    console.log("🔍 Checking waiver status in database...");

    // Check for users with test emails
    const result = await pool.query(`
      SELECT 
        id, email, first_name, last_name, 
        waiver_signed, waiver_signed_date, 
        onboarding_completed, created_at
      FROM users 
      WHERE email LIKE '%test%' OR email LIKE '%debug%'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`📊 Found ${result.rows.length} test users:`);
    result.rows.forEach((user) => {
      console.log(
        `- ${user.email}: waiver_signed=${user.waiver_signed}, onboarding_completed=${user.onboarding_completed}`
      );
    });
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    await pool.end();
  }
}

testWaiverStatus();
