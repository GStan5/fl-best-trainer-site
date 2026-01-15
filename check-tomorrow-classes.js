// Test script to check what classes are in the database
const sql = require("./lib/database");

async function checkClasses() {
  try {
    console.log("Checking classes in database...\n");

    // Get all classes from the database
    const allClasses = await sql`
      SELECT 
        id, title, date, start_time, end_time, is_active
      FROM classes 
      ORDER BY date ASC, start_time ASC
    `;

    console.log(`Total classes in database: ${allClasses.length}`);

    // Filter for active classes
    const activeClasses = allClasses.filter((c) => c.is_active);
    console.log(`Active classes: ${activeClasses.length}`);

    // Show classes for the next few days
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    console.log(`\nToday: ${today}`);
    console.log(`Tomorrow: ${tomorrow}`);
    console.log(`Day after: ${dayAfter}\n`);

    console.log("=== Classes for next 3 days ===");

    const upcomingClasses = activeClasses
      .filter((c) => {
        return c.date >= today;
      })
      .slice(0, 10); // Show first 10

    if (upcomingClasses.length === 0) {
      console.log("No upcoming classes found!");
    } else {
      upcomingClasses.forEach((c) => {
        const dateStr =
          c.date instanceof Date ? c.date.toISOString().split("T")[0] : c.date;
        console.log(
          `- ${dateStr} ${c.start_time}: ${c.title} (ID: ${c.id}, Active: ${c.is_active})`
        );
      });
    }

    // Specifically check for tomorrow's classes
    console.log(`\n=== Classes specifically for tomorrow (${tomorrow}) ===`);
    const tomorrowClasses = activeClasses.filter((c) => {
      const classDate =
        c.date instanceof Date ? c.date.toISOString().split("T")[0] : c.date;
      return classDate === tomorrow;
    });

    if (tomorrowClasses.length === 0) {
      console.log("No classes scheduled for tomorrow!");
    } else {
      tomorrowClasses.forEach((c) => {
        console.log(`- ${c.start_time}: ${c.title} (ID: ${c.id})`);
      });
    }
  } catch (error) {
    console.error("Error checking classes:", error);
  } finally {
    process.exit(0);
  }
}

checkClasses();
