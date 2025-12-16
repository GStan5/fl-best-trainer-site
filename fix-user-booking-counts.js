const { neon } = require("@neondatabase/serverless");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function fixUserBookingCounts() {
  try {
    console.log("🔧 Starting user booking count fix...");

    // Get all users and their actual vs stored booking counts
    const userBookingData = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.weightlifting_classes_booked as stored_count,
        COALESCE(confirmed_bookings.count, 0) as actual_confirmed_count,
        COALESCE(total_bookings.count, 0) as total_bookings_count
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id, 
          COUNT(*) as count 
        FROM bookings 
        WHERE status = 'confirmed' 
        AND class_id IN (SELECT id FROM classes WHERE date >= CURRENT_DATE)
        GROUP BY user_id
      ) confirmed_bookings ON u.id = confirmed_bookings.user_id
      LEFT JOIN (
        SELECT 
          user_id, 
          COUNT(*) as count 
        FROM bookings 
        WHERE status IN ('confirmed', 'waitlist')
        AND class_id IN (SELECT id FROM classes WHERE date >= CURRENT_DATE)
        GROUP BY user_id
      ) total_bookings ON u.id = total_bookings.user_id
      WHERE confirmed_bookings.count > 0 OR u.weightlifting_classes_booked > 0
      ORDER BY u.email
    `;

    console.log(
      "User ID | Email | Stored Count | Actual Confirmed | Total Bookings | Status"
    );
    console.log("=" + "=".repeat(100));

    let usersNeedingFix = 0;
    const usersToFix = [];

    for (const user of userBookingData) {
      const storedCount = user.stored_count || 0;
      const actualCount = user.actual_confirmed_count || 0;
      const totalCount = user.total_bookings_count || 0;

      const needsFix = storedCount !== actualCount;
      const status = needsFix ? "❌ NEEDS FIX" : "✅ OK";

      if (needsFix) {
        usersNeedingFix++;
        usersToFix.push({
          id: user.id,
          email: user.email,
          storedCount,
          actualCount,
        });
      }

      console.log(
        `${user.id.slice(0, 8)}... | ${user.email.padEnd(30)} | ${storedCount
          .toString()
          .padStart(12)} | ${actualCount.toString().padStart(16)} | ${totalCount
          .toString()
          .padStart(14)} | ${status}`
      );
    }

    console.log(
      `\n🔍 Found ${usersNeedingFix} users with incorrect booking counts.`
    );

    if (usersNeedingFix > 0) {
      console.log("\n🔧 Fixing user booking counts...");

      for (const user of usersToFix) {
        await sql`
          UPDATE users 
          SET weightlifting_classes_booked = ${user.actualCount}
          WHERE id = ${user.id}
        `;
        console.log(
          `  ✅ Updated ${user.email}: ${user.storedCount} → ${user.actualCount}`
        );
      }

      console.log(`\n✅ Fixed booking counts for ${usersNeedingFix} users.`);

      // Verify the fixes
      console.log("\n📊 After correction:");
      const verificationData = await sql`
        SELECT 
          u.id,
          u.email,
          u.weightlifting_classes_booked as stored_count,
          COALESCE(confirmed_bookings.count, 0) as actual_confirmed_count
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id, 
            COUNT(*) as count 
          FROM bookings 
          WHERE status = 'confirmed' 
          AND class_id IN (SELECT id FROM classes WHERE date >= CURRENT_DATE)
          GROUP BY user_id
        ) confirmed_bookings ON u.id = confirmed_bookings.user_id
        WHERE u.weightlifting_classes_booked != COALESCE(confirmed_bookings.count, 0)
      `;

      if (verificationData.length === 0) {
        console.log("✅ All user booking counts are now correct!");
      } else {
        console.log("❌ Still have mismatched counts:");
        verificationData.forEach((user) => {
          console.log(
            `  ${user.email}: stored=${user.stored_count}, actual=${user.actual_confirmed_count}`
          );
        });
      }
    }

    // Show a summary of current user booking status
    console.log("\n📈 Summary of all users with bookings:");
    const summaryData = await sql`
      SELECT 
        COUNT(*) as total_users_with_bookings,
        SUM(u.weightlifting_classes_booked) as total_stored_bookings,
        SUM(COALESCE(confirmed_bookings.count, 0)) as total_actual_bookings
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id, 
          COUNT(*) as count 
        FROM bookings 
        WHERE status = 'confirmed' 
        AND class_id IN (SELECT id FROM classes WHERE date >= CURRENT_DATE)
        GROUP BY user_id
      ) confirmed_bookings ON u.id = confirmed_bookings.user_id
      WHERE u.weightlifting_classes_booked > 0 OR confirmed_bookings.count > 0
    `;

    if (summaryData.length > 0) {
      const summary = summaryData[0];
      console.log(
        `  - Users with bookings: ${summary.total_users_with_bookings}`
      );
      console.log(
        `  - Total stored booking count: ${summary.total_stored_bookings}`
      );
      console.log(
        `  - Total actual confirmed bookings: ${summary.total_actual_bookings}`
      );
    }
  } catch (error) {
    console.error("Error fixing user booking counts:", error);
  }
}

// Run the fix
fixUserBookingCounts()
  .then(() => {
    console.log("\n🎉 User booking count fix completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to fix user booking counts:", error);
    process.exit(1);
  });
