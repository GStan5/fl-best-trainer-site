// Check current booking status for debugging
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function checkBookingStatus() {
  try {
    console.log("🔍 Checking booking status for gavinstanifer@live.com...\n");

    const sql = neon(process.env.DATABASE_URL);

    // Get user info first
    const users = await sql`
      SELECT 
        id, email, first_name, last_name,
        weightlifting_classes_booked,
        weightlifting_classes_remaining
      FROM users 
      WHERE email = 'gavinstanifer@live.com'
    `;

    if (users.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = users[0];
    console.log("=== USER INFO ===");
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Classes Booked: ${user.weightlifting_classes_booked}`);
    console.log(`Classes Remaining: ${user.weightlifting_classes_remaining}`);

    // Get all bookings for this user
    const bookings = await sql`
      SELECT 
        b.id,
        b.status,
        b.booking_date,
        c.title,
        c.date,
        c.start_time
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = ${user.id}
      ORDER BY c.date DESC, c.start_time DESC
      LIMIT 10
    `;

    console.log(`\n=== RECENT BOOKINGS (${bookings.length} found) ===`);
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.title}`);
      console.log(`   Date: ${booking.date} ${booking.start_time}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Booking ID: ${booking.id}`);
      console.log(`   Booked on: ${booking.booking_date}`);
      console.log("   ---");
    });

    // Count active bookings
    const activeBookings = bookings.filter((b) => b.status !== "cancelled");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

    console.log(`\n=== SUMMARY ===`);
    console.log(`Active bookings: ${activeBookings.length}`);
    console.log(`Cancelled bookings: ${cancelledBookings.length}`);
    console.log(`Database says booked: ${user.weightlifting_classes_booked}`);

    if (activeBookings.length !== user.weightlifting_classes_booked) {
      console.log(
        `⚠️  MISMATCH: Active bookings (${activeBookings.length}) != Database count (${user.weightlifting_classes_booked})`
      );
    } else {
      console.log(`✅ Booking counts match!`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkBookingStatus();
