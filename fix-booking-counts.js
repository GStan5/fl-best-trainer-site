// Fix booking count mismatch
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function fixBookingCounts() {
  try {
    console.log(
      "🔧 Fixing booking count mismatch for gavinstanifer@live.com...\n"
    );

    const sql = neon(process.env.DATABASE_URL);

    // Get user info
    const users = await sql`
      SELECT id, email, weightlifting_classes_booked, weightlifting_classes_remaining
      FROM users 
      WHERE email = 'gavinstanifer@live.com'
    `;

    if (users.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = users[0];
    console.log("Current status:");
    console.log(
      `- Database booked count: ${user.weightlifting_classes_booked}`
    );
    console.log(
      `- Database remaining: ${user.weightlifting_classes_remaining}`
    );

    // Count actual active bookings
    const activeBookings = await sql`
      SELECT COUNT(*) as count
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = ${user.id} 
        AND b.status != 'cancelled'
        AND c.date >= CURRENT_DATE
    `;

    const actualActiveCount = parseInt(activeBookings[0].count);
    console.log(`- Actual active bookings: ${actualActiveCount}`);

    if (actualActiveCount === user.weightlifting_classes_booked) {
      console.log("✅ Counts already match! No fix needed.");
      return;
    }

    console.log(`\n🔧 Fixing mismatch...`);

    // Update the database to match reality
    await sql`
      UPDATE users 
      SET 
        weightlifting_classes_booked = ${actualActiveCount},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log(
      `✅ Fixed! Updated booked count from ${user.weightlifting_classes_booked} to ${actualActiveCount}`
    );

    // Verify the fix
    const updatedUser = await sql`
      SELECT weightlifting_classes_booked, weightlifting_classes_remaining
      FROM users 
      WHERE id = ${user.id}
    `;

    console.log("\nUpdated status:");
    console.log(
      `- Database booked count: ${updatedUser[0].weightlifting_classes_booked}`
    );
    console.log(
      `- Database remaining: ${updatedUser[0].weightlifting_classes_remaining}`
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

fixBookingCounts();
