const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function cleanupOrphanedBookings() {
  const client = await pool.connect();

  try {
    console.log("🧹 Starting orphaned bookings cleanup...");

    // Find bookings that point to non-existent classes
    const orphanedBookings = await client.query(`
      SELECT b.*, c.id as class_exists, c.is_active
      FROM bookings b
      LEFT JOIN classes c ON b.class_id = c.id
      WHERE c.id IS NULL OR c.is_active = false
    `);

    console.log(`Found ${orphanedBookings.rowCount} orphaned bookings`);

    if (orphanedBookings.rowCount > 0) {
      // Show details of orphaned bookings
      console.log("📋 Orphaned bookings details:");
      for (const booking of orphanedBookings.rows) {
        console.log(
          `  - Booking ID: ${booking.id}, Class ID: ${booking.class_id}, User: ${booking.user_id}`
        );
        if (booking.class_exists && !booking.is_active) {
          console.log(`    ⚠️  Class exists but is inactive`);
        } else {
          console.log(`    ❌ Class doesn't exist`);
        }
      }

      // Delete orphaned bookings
      const deleteResult = await client.query(`
        DELETE FROM bookings 
        WHERE class_id NOT IN (
          SELECT id FROM classes WHERE is_active = true
        )
      `);

      console.log(`✅ Deleted ${deleteResult.rowCount} orphaned bookings`);
    } else {
      console.log("✅ No orphaned bookings found - database is clean!");
    }

    // Verify cleanup
    const remainingBookings = await client.query(`
      SELECT COUNT(*) as count FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE c.is_active = true
    `);

    console.log(
      `📊 Remaining valid bookings: ${remainingBookings.rows[0].count}`
    );
    console.log("🎉 Orphaned bookings cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  cleanupOrphanedBookings();
}

module.exports = { cleanupOrphanedBookings };
