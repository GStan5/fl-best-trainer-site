require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function checkBookings() {
  try {
    console.log("🔍 Checking current bookings in database...");

    // First, let's see all bookings with class details
    const allBookings = await sql`
      SELECT 
        b.id,
        b.status,
        b.google_calendar_event_id,
        b.created_at,
        u.email,
        c.title as class_title,
        c.date,
        c.start_time,
        c.end_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN classes c ON b.class_id = c.id
      WHERE c.date >= CURRENT_DATE
      ORDER BY c.date, c.start_time
    `;

    console.log("\n📅 All upcoming bookings:");
    allBookings.forEach((booking) => {
      console.log(`- ${booking.email}: ${booking.class_title}`);
      console.log(`  Date: ${booking.date} at ${booking.start_time}`);
      console.log(`  Status: ${booking.status || "confirmed"}`);
      console.log(
        `  Calendar Event ID: ${booking.google_calendar_event_id || "None"}`
      );
      console.log(`  Booking ID: ${booking.id}`);
      console.log("---");
    });

    // Check if the new column was added properly
    const columnCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'google_calendar_event_id'
    `;

    console.log("\n🏗️ Column check:");
    if (columnCheck.length > 0) {
      console.log("✅ google_calendar_event_id column exists");
      console.log(`   Type: ${columnCheck[0].data_type}`);
      console.log(`   Nullable: ${columnCheck[0].is_nullable}`);
    } else {
      console.log("❌ google_calendar_event_id column NOT found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking bookings:", error);
    process.exit(1);
  }
}

checkBookings();
