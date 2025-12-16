const { neon } = require("@neondatabase/serverless");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function fixDuplicateBookings() {
  try {
    console.log("🔧 Starting accidental duplicate booking cleanup...");

    // Find potential accidental duplicates (same user, class, status, and booking times within 30 seconds)
    const duplicateBookings = await sql`
      WITH potential_duplicates AS (
        SELECT 
          user_id, 
          class_id,
          status,
          id,
          booking_date,
          LAG(booking_date) OVER (PARTITION BY user_id, class_id, status ORDER BY booking_date) as prev_booking_date
        FROM bookings
        WHERE status IN ('confirmed', 'waitlist')
      )
      SELECT 
        user_id,
        class_id,
        status,
        ARRAY_AGG(id ORDER BY booking_date ASC) as booking_ids,
        ARRAY_AGG(booking_date ORDER BY booking_date ASC) as dates
      FROM potential_duplicates
      WHERE prev_booking_date IS NOT NULL 
      AND EXTRACT(EPOCH FROM (booking_date - prev_booking_date)) < 30
      GROUP BY user_id, class_id, status
    `;

    if (duplicateBookings.length === 0) {
      console.log("✅ No accidental duplicate bookings found.");
      console.log(
        "ℹ️  Multiple bookings by the same user are allowed for friends/family."
      );
      return;
    }

    console.log(
      `Found ${duplicateBookings.length} sets of likely accidental duplicate bookings (booked within 30 seconds):`
    );

    for (const dup of duplicateBookings) {
      console.log(
        `\nUser ${dup.user_id} has rapid duplicate bookings for class ${dup.class_id} (${dup.status})`
      );
      console.log(`Booking IDs: ${dup.booking_ids.join(", ")}`);
      console.log(`Dates: ${dup.dates.join(", ")}`);

      // Keep the first booking (oldest) and remove the rest
      const keepBookingId = dup.booking_ids[0];
      const removeBookingIds = dup.booking_ids.slice(1);

      console.log(
        `Keeping booking ${keepBookingId}, removing likely accidental duplicates: ${removeBookingIds.join(
          ", "
        )}`
      );

      // Remove the duplicate bookings
      for (const removeId of removeBookingIds) {
        await sql`
          DELETE FROM bookings WHERE id = ${removeId}
        `;
        console.log(`  ✅ Removed accidental duplicate booking ${removeId}`);
      }
    }

    // Recalculate participant counts after cleanup
    console.log("\n🔄 Recalculating participant counts...");
    await sql`
      UPDATE classes 
      SET current_participants = (
        SELECT COUNT(*) 
        FROM bookings 
        WHERE bookings.class_id = classes.id 
        AND bookings.status = 'confirmed'
      )
      WHERE is_active = true
    `;

    console.log("✅ Participant counts updated.");

    // Show remaining multiple bookings (these are likely legitimate)
    const multipleBookings = await sql`
      SELECT 
        user_id, 
        class_id, 
        COUNT(*) as booking_count,
        ARRAY_AGG(status) as statuses,
        ARRAY_AGG(booking_date ORDER BY booking_date) as dates
      FROM bookings
      WHERE status IN ('confirmed', 'waitlist')
      GROUP BY user_id, class_id
      HAVING COUNT(*) > 1
    `;

    if (multipleBookings.length === 0) {
      console.log("✅ No multiple bookings remaining.");
    } else {
      console.log(
        `\nℹ️  ${multipleBookings.length} users still have multiple bookings (likely legitimate for friends/family):`
      );
      multipleBookings.forEach((booking) => {
        const timeDiffs = [];
        for (let i = 1; i < booking.dates.length; i++) {
          const diff =
            Math.abs(
              new Date(booking.dates[i]) - new Date(booking.dates[i - 1])
            ) / 1000;
          timeDiffs.push(`${diff}s`);
        }
        console.log(
          `  User ${booking.user_id.slice(0, 8)}... has ${
            booking.booking_count
          } bookings, time gaps: ${timeDiffs.join(", ")}`
        );
      });
    }
  } catch (error) {
    console.error("Error fixing duplicate bookings:", error);
  }
}

// Run the cleanup
fixDuplicateBookings()
  .then(() => {
    console.log("\n🎉 Duplicate booking cleanup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to clean up duplicate bookings:", error);
    process.exit(1);
  });
