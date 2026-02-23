/**
 * Extend Classes Script
 *
 * Generates new class instances for existing recurring schedules
 * through a specified end date, skipping dates that already have classes.
 */

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const END_DATE = "2027-12-31";

// The 6 weekly class slots to extend
const SCHEDULE = [
  {
    day: 2,
    startTime: "06:30:00",
    endTime: "07:30:00",
    parentId: "3a345848-ea36-47c0-bdde-8c25d429068c",
  }, // Tuesday 6:30
  {
    day: 2,
    startTime: "07:30:00",
    endTime: "08:30:00",
    parentId: "3b775a13-5a5f-4b14-a0ea-b778b0156aca",
  }, // Tuesday 7:30
  {
    day: 4,
    startTime: "06:30:00",
    endTime: "07:30:00",
    parentId: "3a345848-ea36-47c0-bdde-8c25d429068c",
  }, // Thursday 6:30
  {
    day: 4,
    startTime: "07:30:00",
    endTime: "08:30:00",
    parentId: "3b775a13-5a5f-4b14-a0ea-b778b0156aca",
  }, // Thursday 7:30
  {
    day: 6,
    startTime: "07:00:00",
    endTime: "08:00:00",
    parentId: "3a345848-ea36-47c0-bdde-8c25d429068c",
  }, // Saturday 7:00
  {
    day: 6,
    startTime: "08:00:00",
    endTime: "09:00:00",
    parentId: "3b775a13-5a5f-4b14-a0ea-b778b0156aca",
  }, // Saturday 8:00
];

// Common class properties
const CLASS_TEMPLATE = {
  title: "Intro Weight Lifting – Exclusive 4-Person Training",
  description:
    "Perfect introduction to weight lifting in a small group setting.",
  instructor: "Gavin Stanifer, NASM-CPT",
  max_participants: 4,
  location: "Bayfront Park Recreation Center",
  class_type: "Strength Training",
  difficulty_level: "Beginner",
  equipment_needed: "Dumbbells, barbells, weight plates, bench, squat rack",
  price_per_session: 35.0,
  credits_required: 1,
  duration_minutes: 60,
  is_active: true,
  is_recurring: true,
};

function getDatesBetween(startDate, endDate, dayOfWeek) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  // Advance to next occurrence of the desired day
  while (current.getUTCDay() !== dayOfWeek) {
    current.setUTCDate(current.getUTCDate() + 1);
  }

  while (current <= end) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }

  return dates;
}

async function main() {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get existing class dates to avoid duplicates
  const existingClasses = await sql`
    SELECT date, start_time FROM classes WHERE is_active = true
  `;
  const existingSet = new Set(
    existingClasses.map((c) => {
      const d = new Date(c.date).toISOString().split("T")[0];
      return `${d}_${c.start_time}`;
    }),
  );

  console.log(`\n📅 Extending classes through ${END_DATE}\n`);
  console.log(`   Existing classes in database: ${existingClasses.length}`);
  console.log("");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const slot of SCHEDULE) {
    const slotName = `${dayNames[slot.day]} ${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)}`;
    console.log(`\n🔄 Processing: ${slotName}`);

    // Start from tomorrow to avoid creating past classes
    const startFrom = new Date();
    startFrom.setUTCDate(startFrom.getUTCDate() + 1);
    const startStr = startFrom.toISOString().split("T")[0];

    const allDates = getDatesBetween(startStr, END_DATE, slot.day);
    let created = 0;
    let skipped = 0;

    for (const date of allDates) {
      const dateStr = date.toISOString().split("T")[0];
      const key = `${dateStr}_${slot.startTime}`;

      if (existingSet.has(key)) {
        skipped++;
        continue;
      }

      // Create the class instance
      await sql`
        INSERT INTO classes (
          title, description, instructor, date, start_time, end_time,
          max_participants, current_participants, location, class_type,
          difficulty_level, equipment_needed, price_per_session, credits_required,
          duration_minutes, is_active, is_recurring, parent_recurring_id
        ) VALUES (
          ${CLASS_TEMPLATE.title},
          ${CLASS_TEMPLATE.description},
          ${CLASS_TEMPLATE.instructor},
          ${dateStr}::date,
          ${slot.startTime}::time,
          ${slot.endTime}::time,
          ${CLASS_TEMPLATE.max_participants},
          0,
          ${CLASS_TEMPLATE.location},
          ${CLASS_TEMPLATE.class_type},
          ${CLASS_TEMPLATE.difficulty_level},
          ${CLASS_TEMPLATE.equipment_needed},
          ${CLASS_TEMPLATE.price_per_session},
          ${CLASS_TEMPLATE.credits_required},
          ${CLASS_TEMPLATE.duration_minutes},
          ${CLASS_TEMPLATE.is_active},
          ${CLASS_TEMPLATE.is_recurring},
          ${slot.parentId}
        )
      `;

      created++;
      existingSet.add(key); // Mark as created to prevent duplicates within this run
    }

    console.log(
      `   ✅ Created: ${created} | ⏭️  Skipped (existing): ${skipped} | Total dates checked: ${allDates.length}`,
    );
    totalCreated += created;
    totalSkipped += skipped;
  }

  console.log("\n" + "=".repeat(50));
  console.log(
    `📊 TOTAL: ${totalCreated} new classes created, ${totalSkipped} skipped (already exist)`,
  );
  console.log("=".repeat(50) + "\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
