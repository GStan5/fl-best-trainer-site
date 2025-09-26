const { neon } = require("@neondatabase/serverless");

// Get DATABASE_URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function addDailyScheduleField() {
  try {
    console.log(
      "🔄 Adding daily_schedule field to recurring_class_templates..."
    );

    // Add daily_schedule JSONB field to store different times for different days
    await sql`
      ALTER TABLE recurring_class_templates 
      ADD COLUMN IF NOT EXISTS daily_schedule JSONB DEFAULT '{}'::jsonb
    `;
    console.log("✅ Added daily_schedule field");

    // Migrate existing start_time/end_time data to daily_schedule
    const templates = await sql`
      SELECT id, recurring_days, start_time, end_time 
      FROM recurring_class_templates 
      WHERE daily_schedule = '{}'::jsonb
    `;

    for (const template of templates) {
      const dailySchedule = {};

      // For each recurring day, set the same start/end time
      if (template.recurring_days && template.start_time && template.end_time) {
        for (const day of template.recurring_days) {
          dailySchedule[day] = {
            start_time: template.start_time,
            end_time: template.end_time,
          };
        }

        await sql`
          UPDATE recurring_class_templates 
          SET daily_schedule = ${JSON.stringify(dailySchedule)}
          WHERE id = ${template.id}
        `;
      }
    }

    console.log(
      `✅ Migrated ${templates.length} templates to use daily_schedule`
    );
    console.log("🎉 Daily schedule field added successfully!");
  } catch (error) {
    console.error("❌ Failed to add daily_schedule field:", error);
  }
}

addDailyScheduleField();
