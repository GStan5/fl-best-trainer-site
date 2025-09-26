/**
 * Test utility to create multiple classes for the same day
 * Run with: node test-multiple-classes.js
 *
 * This script creates 6 test classes for today to test the calendar's
 * ability to handle multiple classes per day.
 */

const sql = require("./lib/database.js").default;

async function createTestClasses() {
  console.log("🧪 Creating multiple test classes for today...");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const testClasses = [
    {
      title: "Morning Strength",
      start_time: "07:00",
      end_time: "08:00",
      description: "Early morning strength training",
    },
    {
      title: "Cardio Blast",
      start_time: "09:00",
      end_time: "10:00",
      description: "High-intensity cardio workout",
    },
    {
      title: "Yoga Flow",
      start_time: "11:00",
      end_time: "12:00",
      description: "Relaxing yoga flow session",
    },
    {
      title: "Lunch Break HIIT",
      start_time: "12:30",
      end_time: "13:30",
      description: "Quick HIIT session for busy schedules",
    },
    {
      title: "Afternoon Lift",
      start_time: "15:00",
      end_time: "16:00",
      description: "Afternoon weightlifting session",
    },
    {
      title: "Evening Wind Down",
      start_time: "18:00",
      end_time: "19:00",
      description: "Evening stretching and cooldown",
    },
  ];

  try {
    for (let i = 0; i < testClasses.length; i++) {
      const testClass = testClasses[i];

      await sql`
        INSERT INTO classes (
          title, 
          description, 
          instructor,
          date,
          start_time,
          end_time,
          max_participants,
          location,
          class_type,
          difficulty_level,
          equipment_needed,
          price_per_session,
          credits_required,
          duration_minutes,
          is_active
        ) VALUES (
          ${testClass.title},
          ${testClass.description},
          'Gavin Stanifer, NASM-CPT',
          ${todayStr},
          ${testClass.start_time},
          ${testClass.end_time},
          4,
          'Bayfront Park Recreation Center',
          'Strength Training',
          'Beginner',
          'Various equipment provided',
          40.0,
          1,
          60,
          true
        )
      `;

      console.log(`✅ Created: ${testClass.title} at ${testClass.start_time}`);
    }

    console.log(
      `\n🎉 Successfully created ${testClasses.length} test classes for ${todayStr}`
    );
    console.log(
      "📅 Check your calendar to see how it handles multiple classes per day!"
    );

    // Clean up instruction
    console.log("\n🧹 To remove test classes later, run:");
    console.log(
      `DELETE FROM classes WHERE date = '${todayStr}' AND instructor LIKE '%Test%';`
    );
  } catch (error) {
    console.error("❌ Error creating test classes:", error);
  } finally {
    process.exit(0);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  createTestClasses();
}

module.exports = { createTestClasses };
