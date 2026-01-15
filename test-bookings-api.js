// Test script to check what the bookings API returns
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function testBookingsAPI() {
  try {
    console.log("🔍 Testing bookings API data...\n");

    const sql = neon(process.env.DATABASE_URL);

    // This replicates the exact query from /api/bookings.ts
    const bookings = await sql`
      SELECT 
        b.*,
        c.title as class_title,
        c.date,
        c.start_time,
        c.end_time,
        c.location,
        c.class_type,
        c.instructor
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE c.date >= CURRENT_DATE
      ORDER BY c.date ASC, c.start_time ASC
      LIMIT 5
    `;

    console.log(`Found ${bookings.length} upcoming bookings\n`);

    if (bookings.length === 0) {
      console.log("❌ No upcoming bookings found");
      return;
    }

    console.log("=== SAMPLE BOOKING DATA ===");
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`);
      console.log(`- class_title: ${booking.class_title}`);
      console.log(`- date: ${booking.date} (Type: ${typeof booking.date})`);
      console.log(`- start_time: ${booking.start_time}`);
      console.log(`- location: ${booking.location}`);
      console.log(`- Raw date object: ${booking.date}`);

      // Test the current parsing logic from MyUpcomingClassesGrid
      const dateStr = booking.date.split("T")[0]; // This is the line that might fail
      console.log(`- Parsed dateStr: ${dateStr}`);

      try {
        const [year, month, day] = dateStr.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);
        console.log(
          `- Formatted date: ${localDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}`
        );
      } catch (error) {
        console.log(`- ❌ Error parsing date: ${error.message}`);
      }

      console.log("---");
    });

    console.log("\n=== TESTING DATE TYPES ===");
    const firstBooking = bookings[0];
    console.log(`Date is string: ${typeof firstBooking.date === "string"}`);
    console.log(`Date is Date object: ${firstBooking.date instanceof Date}`);
    console.log(`Date toString(): ${firstBooking.date.toString()}`);

    if (firstBooking.date instanceof Date) {
      console.log(`Date toISOString(): ${firstBooking.date.toISOString()}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

testBookingsAPI();
