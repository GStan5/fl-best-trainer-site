// Test API call to see what the /api/classes endpoint returns
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function testApiClasses() {
  try {
    console.log("🔍 Testing /api/classes logic...\n");

    const sql = neon(process.env.DATABASE_URL);

    // This replicates the exact query from /api/classes.ts (lines 153-180)
    const classes = await sql`
      SELECT 
        id,
        title,
        description,
        instructor,
        date,
        start_time,
        end_time,
        max_participants,
        current_participants,
        location,
        class_type,
        difficulty_level,
        equipment_needed,
        is_active,
        price_per_session,
        credits_required,
        cancellation_deadline_hours,
        duration_minutes,
        prerequisites,
        class_goals,
        intensity_level,
        waitlist_enabled,
        waitlist_capacity,
        auto_confirm_booking,
        recurring_pattern,
        class_series_id,
        registration_opens,
        registration_closes,
        safety_requirements,
        age_restrictions,
        modifications_available,
        created_at,
        updated_at
      FROM classes 
      WHERE is_active = true
        AND id NOT IN (
          SELECT DISTINCT class_id 
          FROM bookings 
          WHERE status = 'completed'
        )
      ORDER BY date ASC, start_time ASC
    `;

    console.log(`API Query returned ${classes.length} classes\n`);

    // Focus on the next few days
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    console.log(`Today: ${today}`);
    console.log(`Tomorrow: ${tomorrow}\n`);

    // Show upcoming classes
    console.log("=== UPCOMING CLASSES FROM API ===");
    classes.slice(0, 10).forEach((c) => {
      const classDate =
        c.date instanceof Date ? c.date.toISOString().split("T")[0] : c.date;
      console.log(`${classDate} ${c.start_time}: ${c.title}`);
    });

    // Specifically check tomorrow's class
    console.log(`\n=== TOMORROW'S CLASSES (${tomorrow}) ===`);
    const tomorrowClasses = classes.filter((c) => {
      const classDate =
        c.date instanceof Date ? c.date.toISOString().split("T")[0] : c.date;
      return classDate === tomorrow;
    });

    if (tomorrowClasses.length === 0) {
      console.log("❌ No classes found for tomorrow in API result");
    } else {
      tomorrowClasses.forEach((c) => {
        console.log(`✅ ${c.start_time}: ${c.title} (ID: ${c.id})`);
        console.log(`   Date object: ${c.date}`);
        console.log(`   Is Active: ${c.is_active}`);
        console.log(
          `   Current/Max Participants: ${c.current_participants}/${c.max_participants}`
        );
      });
    }

    // Test frontend filtering logic on tomorrow's class
    if (tomorrowClasses.length > 0) {
      const testClass = tomorrowClasses[0];
      console.log(`\n=== TESTING FRONTEND LOGIC ON TOMORROW'S CLASS ===`);

      // ClassesList.tsx filtering logic
      const classDateTime = new Date(
        `${testClass.date}T${testClass.start_time}`
      );
      const isUpcoming = classDateTime > new Date();
      console.log(`Class DateTime: ${classDateTime.toISOString()}`);
      console.log(`Current Time: ${new Date().toISOString()}`);
      console.log(`Would be shown in ClassesList: ${isUpcoming}`);

      // ClassStats.tsx filtering logic
      const classDateOnly = new Date(testClass.date);
      const isUpcomingStats = classDateOnly >= new Date();
      console.log(`Would be counted in ClassStats: ${isUpcomingStats}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

testApiClasses();
