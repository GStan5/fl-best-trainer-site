const { neon } = require("@neondatabase/serverless");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function debugBookings() {
  try {
    console.log("🔍 Debugging booking data...");

    // Get all bookings for analysis
    const allBookings = await sql`
      SELECT 
        b.id,
        b.user_id,
        b.class_id,
        b.status,
        b.user_package_id,
        b.booking_date,
        u.email as user_email,
        c.title as class_title,
        c.date as class_date,
        c.start_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN classes c ON b.class_id = c.id
      WHERE b.status IN ('confirmed', 'waitlist')
      AND c.date >= CURRENT_DATE
      ORDER BY u.email, c.date ASC
    `;

    console.log(`\nFound ${allBookings.length} active upcoming bookings:\n`);

    // Group by user
    const bookingsByUser = {};
    allBookings.forEach((booking) => {
      if (!bookingsByUser[booking.user_email]) {
        bookingsByUser[booking.user_email] = [];
      }
      bookingsByUser[booking.user_email].push(booking);
    });

    Object.entries(bookingsByUser).forEach(([email, bookings]) => {
      console.log(`📧 ${email}:`);
      bookings.forEach((booking) => {
        const hasPackage = booking.user_package_id
          ? "✅ Has Package"
          : "❌ No Package";
        const adminAdded = !booking.user_package_id
          ? " (likely admin-added)"
          : "";
        console.log(
          `  - ${booking.class_title} on ${
            booking.class_date.toISOString().split("T")[0]
          } at ${booking.start_time}`
        );
        console.log(
          `    Status: ${booking.status} | ${hasPackage}${adminAdded}`
        );
        console.log(
          `    Booking ID: ${booking.id} | Booking Date: ${booking.booking_date}`
        );
      });
      console.log("");
    });

    // Check if there are any users with mixed booking types (some with packages, some without)
    const usersWithMixedBookings = Object.entries(bookingsByUser).filter(
      ([email, bookings]) => {
        const withPackage = bookings.filter((b) => b.user_package_id);
        const withoutPackage = bookings.filter((b) => !b.user_package_id);
        return withPackage.length > 0 && withoutPackage.length > 0;
      }
    );

    if (usersWithMixedBookings.length > 0) {
      console.log("🔍 Users with both self-booked and admin-added classes:");
      usersWithMixedBookings.forEach(([email, bookings]) => {
        const withPackage = bookings.filter((b) => b.user_package_id).length;
        const withoutPackage = bookings.filter(
          (b) => !b.user_package_id
        ).length;
        console.log(
          `  ${email}: ${withPackage} self-booked, ${withoutPackage} admin-added`
        );
      });
    } else {
      console.log("✅ No users have mixed booking types");
    }

    // Test the bookings API query for a specific user (if any exist)
    if (allBookings.length > 0) {
      const testUserEmail = Object.keys(bookingsByUser)[0];
      console.log(`\n🧪 Testing bookings API for user: ${testUserEmail}`);

      const testUserResult = await sql`
        SELECT id FROM users WHERE email = ${testUserEmail}
      `;

      if (testUserResult.length > 0) {
        const testUserId = testUserResult[0].id;

        const apiBookings = await sql`
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
          WHERE b.user_id = ${testUserId}
          ORDER BY c.date DESC, c.start_time DESC
        `;

        console.log(
          `  API would return ${apiBookings.length} bookings for this user`
        );

        // Show upcoming only
        const now = new Date();
        const upcomingFromApi = apiBookings.filter((booking) => {
          const classDate = new Date(booking.date);
          return classDate >= now && booking.status !== "cancelled";
        });

        console.log(
          `  ${upcomingFromApi.length} upcoming bookings (not cancelled)`
        );
        upcomingFromApi.forEach((booking) => {
          console.log(
            `    - ${booking.class_title} on ${
              booking.date.toISOString().split("T")[0]
            } (${booking.status})`
          );
        });
      }
    }
  } catch (error) {
    console.error("Error debugging bookings:", error);
  }
}

// Run the debug
debugBookings()
  .then(() => {
    console.log("\n🎉 Booking debug completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to debug bookings:", error);
    process.exit(1);
  });
