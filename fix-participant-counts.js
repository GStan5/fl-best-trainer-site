const { neon } = require("@neondatabase/serverless");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function fixParticipantCounts() {
  try {
    console.log("🔧 Starting participant count fix...");

    // First, let's see the current state
    console.log("\n📊 Current participant counts in database:");
    const classesWithCounts = await sql`
      SELECT 
        c.id,
        c.title,
        c.date,
        c.current_participants,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as actual_confirmed_count,
        COUNT(CASE WHEN b.status = 'waitlist' THEN 1 END) as waitlist_count,
        COUNT(b.id) as total_bookings
      FROM classes c
      LEFT JOIN bookings b ON c.id = b.class_id
      WHERE c.is_active = true
      GROUP BY c.id, c.title, c.date, c.current_participants
      ORDER BY c.date ASC
    `;

    console.log(
      "Class ID | Title | Date | Stored Count | Actual Confirmed | Waitlist | Total Bookings"
    );
    console.log("=" + "=".repeat(100));

    let inconsistencies = 0;

    for (const cls of classesWithCounts) {
      const storedCount = cls.current_participants || 0;
      const actualCount = parseInt(cls.actual_confirmed_count) || 0;
      const waitlistCount = parseInt(cls.waitlist_count) || 0;
      const totalBookings = parseInt(cls.total_bookings) || 0;

      const isInconsistent = storedCount !== actualCount;
      const status = isInconsistent ? "❌ MISMATCH" : "✅ OK";

      if (isInconsistent) {
        inconsistencies++;
      }

      console.log(
        `${cls.id.slice(0, 8)}... | ${cls.title.slice(0, 20).padEnd(20)} | ${
          cls.date.toISOString().split("T")[0]
        } | ${storedCount.toString().padStart(12)} | ${actualCount
          .toString()
          .padStart(16)} | ${waitlistCount
          .toString()
          .padStart(8)} | ${totalBookings.toString().padStart(14)} | ${status}`
      );
    }

    console.log(
      `\n🔍 Found ${inconsistencies} classes with incorrect participant counts.`
    );

    if (inconsistencies > 0) {
      console.log("\n🔧 Fixing participant counts...");

      // Update all classes to have the correct participant count
      const updateResult = await sql`
        UPDATE classes 
        SET current_participants = (
          SELECT COUNT(*) 
          FROM bookings 
          WHERE bookings.class_id = classes.id 
          AND bookings.status = 'confirmed'
        )
        WHERE is_active = true
      `;

      console.log(`✅ Updated participant counts for classes.`);

      // Show the corrected state
      console.log("\n📊 After correction:");
      const correctedClasses = await sql`
        SELECT 
          c.id,
          c.title,
          c.date,
          c.current_participants,
          COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as actual_confirmed_count
        FROM classes c
        LEFT JOIN bookings b ON c.id = b.class_id
        WHERE c.is_active = true
        GROUP BY c.id, c.title, c.date, c.current_participants
        HAVING c.current_participants != COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)
        ORDER BY c.date ASC
      `;

      if (correctedClasses.length === 0) {
        console.log("✅ All participant counts are now correct!");
      } else {
        console.log("❌ Still have issues:");
        correctedClasses.forEach((cls) => {
          console.log(
            `${cls.title}: stored=${cls.current_participants}, actual=${cls.actual_confirmed_count}`
          );
        });
      }
    }

    // Also check for any orphaned bookings or duplicate bookings
    console.log("\n🔍 Checking for booking issues...");

    const duplicateBookings = await sql`
      SELECT user_id, class_id, COUNT(*) as booking_count
      FROM bookings
      WHERE status IN ('confirmed', 'waitlist')
      GROUP BY user_id, class_id
      HAVING COUNT(*) > 1
    `;

    if (duplicateBookings.length > 0) {
      console.log("❌ Found duplicate bookings:");
      duplicateBookings.forEach((dup) => {
        console.log(
          `User ${dup.user_id} has ${dup.booking_count} bookings for class ${dup.class_id}`
        );
      });
    } else {
      console.log("✅ No duplicate bookings found.");
    }

    const orphanedBookings = await sql`
      SELECT b.id, b.user_id, b.class_id, b.status
      FROM bookings b
      LEFT JOIN classes c ON b.class_id = c.id
      WHERE c.id IS NULL
    `;

    if (orphanedBookings.length > 0) {
      console.log(
        "❌ Found orphaned bookings (bookings for non-existent classes):"
      );
      orphanedBookings.forEach((booking) => {
        console.log(
          `Booking ${booking.id} for user ${booking.user_id} references non-existent class ${booking.class_id}`
        );
      });
    } else {
      console.log("✅ No orphaned bookings found.");
    }
  } catch (error) {
    console.error("Error fixing participant counts:", error);
  }
}

// Run the fix
fixParticipantCounts()
  .then(() => {
    console.log("\n🎉 Participant count fix completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to fix participant counts:", error);
    process.exit(1);
  });
