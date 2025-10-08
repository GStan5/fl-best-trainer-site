require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function runGoogleCalendarMigration() {
  try {
    console.log("🚀 Starting Google Calendar database migration...");

    // Add Google Calendar event ID column to bookings table
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255)
    `;

    // Add index for better performance when querying calendar events
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_id ON bookings(google_calendar_event_id)
    `;

    console.log(
      "✅ Google Calendar database migration completed successfully!"
    );
    console.log("📅 Google Calendar event ID column added to bookings table");
    console.log("📈 Performance index created for calendar event queries");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runGoogleCalendarMigration();
