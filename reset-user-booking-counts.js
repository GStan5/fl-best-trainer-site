const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function resetUserBookingCounts() {
  const client = await pool.connect();

  try {
    console.log("🔄 Resetting user booking counts...");

    // Get current user booking counts
    const currentCounts = await client.query(`
      SELECT id, email, weightlifting_classes_booked 
      FROM users 
      WHERE weightlifting_classes_booked > 0
      ORDER BY weightlifting_classes_booked DESC
    `);

    console.log(`Found ${currentCounts.rowCount} users with booked classes:`);
    for (const user of currentCounts.rows) {
      console.log(
        `  - ${user.email}: ${user.weightlifting_classes_booked} classes`
      );
    }

    // Calculate actual booking counts by joining with active classes
    const actualCounts = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.weightlifting_classes_booked as current_count,
        COUNT(b.id) as actual_count
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      LEFT JOIN classes c ON b.class_id = c.id AND c.is_active = true
      GROUP BY u.id, u.email, u.weightlifting_classes_booked
      HAVING u.weightlifting_classes_booked != COUNT(b.id) OR u.weightlifting_classes_booked > 0
    `);

    console.log(`\n📊 Users with mismatched counts:`);
    for (const user of actualCounts.rows) {
      console.log(
        `  - ${user.email}: stored=${user.current_count}, actual=${user.actual_count}`
      );
    }

    // Reset all users' booking counts to match actual bookings
    const updateResult = await client.query(`
      UPDATE users 
      SET weightlifting_classes_booked = actual_bookings.count
      FROM (
        SELECT 
          u.id,
          COUNT(b.id) as count
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id
        LEFT JOIN classes c ON b.class_id = c.id AND c.is_active = true
        GROUP BY u.id
      ) as actual_bookings
      WHERE users.id = actual_bookings.id
      AND users.weightlifting_classes_booked != actual_bookings.count
    `);

    console.log(`\n✅ Updated ${updateResult.rowCount} user records`);

    // Verify the update
    const verificationResult = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(weightlifting_classes_booked) as total_bookings
      FROM users
    `);

    console.log(`\n📊 Final status:`);
    console.log(`  - Total users: ${verificationResult.rows[0].total_users}`);
    console.log(
      `  - Total bookings across all users: ${verificationResult.rows[0].total_bookings}`
    );

    console.log("\n🎉 User booking counts reset successfully!");
  } catch (error) {
    console.error("❌ Error resetting booking counts:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  resetUserBookingCounts();
}

module.exports = { resetUserBookingCounts };
