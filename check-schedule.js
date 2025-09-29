require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

async function checkSchedule() {
  try {
    console.log("🔍 Checking your current class schedule...\n");

    const sql = neon(process.env.DATABASE_URL);

    // Get current active classes
    const classes = await sql`
      SELECT date, start_time, title, EXTRACT(DOW FROM date) as day_of_week
      FROM classes 
      WHERE is_active = true 
      AND date >= CURRENT_DATE 
      ORDER BY date, start_time
      LIMIT 20
    `;

    console.log("=== CURRENT SCHEDULED CLASSES ===");
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (classes.length === 0) {
      console.log("❌ No active classes found in database");
    } else {
      classes.forEach((c) => {
        console.log(
          `${c.date} (${dayNames[c.day_of_week]}) ${c.start_time} - ${c.title}`
        );
      });
    }

    // Count by day of week
    const dayCount = {};
    classes.forEach((c) => {
      const dayName = dayNames[c.day_of_week];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    console.log("\n=== CLASSES BY DAY OF WEEK ===");
    if (Object.keys(dayCount).length === 0) {
      console.log("No classes scheduled");
    } else {
      Object.entries(dayCount).forEach(([day, count]) => {
        console.log(`${day}: ${count} classes`);
      });
    }

    // Check recurring templates
    console.log("\n=== RECURRING TEMPLATES ===");
    try {
      const templates = await sql`
        SELECT id, title, recurring_days, recurring_start_time, is_active
        FROM recurring_class_templates 
        ORDER BY created_at DESC
      `;

      if (templates.length === 0) {
        console.log("❌ No recurring templates found");
      } else {
        templates.forEach((template) => {
          const status = template.is_active ? "✅ Active" : "❌ Inactive";
          console.log(`${status} - ${template.title}`);
          console.log(
            `  Days: ${template.recurring_days?.join(", ") || "None"}`
          );
          console.log(`  Time: ${template.recurring_start_time || "Not set"}`);
          console.log("");
        });
      }
    } catch (error) {
      console.log(
        "⚠️  Could not check recurring templates (table may not exist)"
      );
    }

    // Summary
    console.log("=== SUMMARY ===");
    const actualDays = Object.keys(dayCount).sort();
    if (actualDays.length > 0) {
      console.log(
        `📅 Your database currently has classes on: ${actualDays.join(", ")}`
      );
    } else {
      console.log("📅 Your database has no scheduled classes");
    }
  } catch (error) {
    console.error("❌ Error checking schedule:", error.message);

    if (error.message.includes("DATABASE_URL")) {
      console.log("\n💡 Make sure your .env.local file has DATABASE_URL set");
    }
  }
}

checkSchedule();
