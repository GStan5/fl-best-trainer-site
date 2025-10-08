require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function checkAndFixOct28Class() {
  try {
    console.log("🔍 Checking October 28th classes...");

    // Check current state
    const classes = await sql`
      SELECT id, title, date, current_participants, max_participants 
      FROM classes 
      WHERE date::text LIKE '2025-10-28%'
      ORDER BY start_time
    `;

    console.log("\n📅 October 28th classes:");
    classes.forEach((c) => {
      console.log(
        `- ${c.title}: ${c.current_participants}/${c.max_participants} (ID: ${c.id})`
      );
    });

    // Find classes with negative participants
    const negativeClasses = classes.filter((c) => c.current_participants < 0);

    if (negativeClasses.length > 0) {
      console.log("\n⚠️ Found classes with negative participants:");

      for (const classItem of negativeClasses) {
        console.log(`\n🔧 Fixing ${classItem.title} (ID: ${classItem.id})`);
        console.log(
          `   Before: ${classItem.current_participants}/${classItem.max_participants}`
        );

        // Reset to 0 participants
        await sql`
          UPDATE classes 
          SET current_participants = 0 
          WHERE id = ${classItem.id}
        `;

        console.log(`   After: 0/${classItem.max_participants} ✅`);
      }
    } else {
      console.log("\n✅ No classes with negative participants found");
    }

    // Check all classes for negative participants
    console.log("\n🔍 Checking all classes for negative participants...");
    const allNegative = await sql`
      SELECT id, title, date, current_participants, max_participants 
      FROM classes 
      WHERE current_participants < 0
    `;

    if (allNegative.length > 0) {
      console.log(
        `\n⚠️ Found ${allNegative.length} classes with negative participants:`
      );

      for (const classItem of allNegative) {
        console.log(`\n🔧 Fixing ${classItem.title} on ${classItem.date}`);
        console.log(
          `   Before: ${classItem.current_participants}/${classItem.max_participants}`
        );

        await sql`
          UPDATE classes 
          SET current_participants = 0 
          WHERE id = ${classItem.id}
        `;

        console.log(`   After: 0/${classItem.max_participants} ✅`);
      }
    } else {
      console.log("✅ No classes with negative participants found");
    }

    console.log("\n✅ All done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAndFixOct28Class();
