const sql = require("../lib/database.ts").default;
const { readFileSync } = require("fs");
const { join } = require("path");

async function runMigration() {
  try {
    console.log("🚀 Starting Google Calendar database migration...");

    const migrationPath = join(__dirname, "add-google-calendar-event-id.sql");
    const migration = readFileSync(migrationPath, "utf8");

    await sql.unsafe(migration);

    console.log("✅ Database migration completed successfully!");
    console.log("📅 Google Calendar event ID column added to bookings table");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
