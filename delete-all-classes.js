const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function deleteAllClasses() {
  const client = await pool.connect();

  try {
    console.log("🗑️  Starting database cleanup...");

    // First delete all bookings (foreign key constraint)
    const deleteBookingsResult = await client.query("DELETE FROM bookings");
    console.log(`✅ Deleted ${deleteBookingsResult.rowCount} bookings`);

    // Delete all classes
    const deleteClassesResult = await client.query("DELETE FROM classes");
    console.log(`✅ Deleted ${deleteClassesResult.rowCount} classes`);

    // Delete all recurring classes (if table exists)
    try {
      const deleteRecurringResult = await client.query(
        "DELETE FROM recurring_classes"
      );
      console.log(
        `✅ Deleted ${deleteRecurringResult.rowCount} recurring classes`
      );
    } catch (error) {
      if (error.code === "42P01") {
        console.log("ℹ️  recurring_classes table does not exist (skipping)");
      } else {
        throw error;
      }
    }

    console.log("🎉 Database cleanup completed successfully!");

    // Verify cleanup
    const classCount = await client.query("SELECT COUNT(*) FROM classes");
    const bookingCount = await client.query("SELECT COUNT(*) FROM bookings");

    let recurringCount = { rows: [{ count: "N/A" }] };
    try {
      recurringCount = await client.query(
        "SELECT COUNT(*) FROM recurring_classes"
      );
    } catch (error) {
      // Table doesn't exist
    }

    console.log("\n📊 Final counts:");
    console.log(`Classes: ${classCount.rows[0].count}`);
    console.log(`Recurring Classes: ${recurringCount.rows[0].count}`);
    console.log(`Bookings: ${bookingCount.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteAllClasses();
