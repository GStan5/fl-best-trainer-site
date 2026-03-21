// Check client class bookings
// Usage: node check-client-classes.js "client name"
// Usage: node check-client-classes.js "client1" "client2" "client3"
// Usage: node check-client-classes.js (shows all clients)

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

async function checkClientClasses(searchTerms) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    let users;

    if (searchTerms.length === 0) {
      // No search term provided - show all users with bookings
      console.log("🔍 Fetching all clients with bookings...\n");

      users = await sql`
        SELECT DISTINCT u.id, u.name, u.email
        FROM users u
        JOIN bookings b ON u.id = b.user_id
        JOIN classes c ON b.class_id = c.id
        WHERE c.is_active = true
        ORDER BY u.name ASC
      `;
    } else {
      // Search for specific users
      console.log(`🔍 Looking for: ${searchTerms.join(", ")}\n`);

      // Get all users first, then filter in JavaScript for multiple search terms
      const allUsers = await sql`
        SELECT id, name, email
        FROM users
        ORDER BY name ASC
      `;

      users = allUsers.filter((user) => {
        return searchTerms.some((term) => {
          const lowerTerm = term.toLowerCase();
          const lowerName = (user.name || "").toLowerCase();
          const lowerEmail = (user.email || "").toLowerCase();
          return (
            lowerName.includes(lowerTerm) || lowerEmail.includes(lowerTerm)
          );
        });
      });
    }

    if (users.length === 0) {
      if (searchTerms.length > 0) {
        console.log("❌ No users found matching the search term(s)");
      } else {
        console.log("❌ No users with active bookings found");
      }
      return;
    }

    console.log(`✅ Found ${users.length} client(s):\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // Get bookings for each user found
    for (const user of users) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📋 Bookings for ${user.name}:`);
      console.log("=".repeat(60));

      const bookings = await sql`
        SELECT 
          b.id as booking_id,
          b.status,
          c.id as class_id,
          c.title,
          c.date,
          c.start_time,
          c.end_time,
          c.current_participants,
          c.max_participants
        FROM bookings b
        JOIN classes c ON b.class_id = c.id
        WHERE b.user_id = ${user.id}
          AND c.is_active = true
        ORDER BY c.date ASC, c.start_time ASC
      `;

      if (bookings.length === 0) {
        console.log("\n  No active bookings found.");
      } else {
        console.log(`\n  Total bookings: ${bookings.length}\n`);

        const now = new Date();
        const today = new Date(
          now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
        );

        const upcoming = bookings.filter((b) => new Date(b.date) >= today);
        const past = bookings.filter((b) => new Date(b.date) < today);

        if (upcoming.length > 0) {
          console.log(`  📅 UPCOMING CLASSES (${upcoming.length}):\n`);
          upcoming.forEach((booking, i) => {
            const dateObj = new Date(booking.date);
            const dayName = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              timeZone: "UTC",
            });
            const dateStr = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });
            const timeStr = formatTime(booking.start_time);
            const statusIcon =
              booking.status === "confirmed"
                ? "✅"
                : booking.status === "waitlist"
                  ? "⏳"
                  : "❓";

            console.log(`  ${i + 1}. ${statusIcon} ${booking.title}`);
            console.log(`     ${dayName}, ${dateStr} at ${timeStr}`);
            console.log(
              `     Capacity: ${booking.current_participants}/${booking.max_participants}`,
            );
            console.log(
              `     Class ID: ${booking.class_id}, Booking ID: ${booking.booking_id}`,
            );
            console.log("");
          });
        }

        if (past.length > 0) {
          console.log(`  📜 PAST CLASSES (${past.length}):\n`);
          past.forEach((booking, i) => {
            const dateObj = new Date(booking.date);
            const dateStr = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });
            const timeStr = formatTime(booking.start_time);

            console.log(
              `  ${i + 1}. ${booking.title} - ${dateStr} at ${timeStr}`,
            );
          });
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

// Get search terms from command line arguments
const searchTerms = process.argv.slice(2);

checkClientClasses(searchTerms);
