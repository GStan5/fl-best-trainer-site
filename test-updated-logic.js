// Test the updated ClassesList filtering logic
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function testUpdatedLogic() {
  try {
    console.log("🔍 Testing updated ClassesList logic...\n");

    const sql = neon(process.env.DATABASE_URL);

    // Get tomorrow's class from the database
    const classes = await sql`
      SELECT 
        id, title, date, start_time, end_time, is_active
      FROM classes 
      WHERE is_active = true
        AND date = '2025-10-15'
      LIMIT 1
    `;

    if (classes.length === 0) {
      console.log("❌ No classes found for tomorrow");
      return;
    }

    const testClass = classes[0];
    console.log("Raw class data from DB:", testClass);
    console.log("Date type:", typeof testClass.date);
    console.log("Date value:", testClass.date);

    // Test the updated logic
    const dateStr =
      typeof testClass.date === "string"
        ? testClass.date
        : new Date(testClass.date).toISOString().split("T")[0];

    console.log("Converted dateStr:", dateStr);

    const classDateTime = new Date(`${dateStr}T${testClass.start_time}`);
    const isUpcoming = classDateTime > new Date();

    console.log("Class DateTime:", classDateTime.toISOString());
    console.log("Current Time:", new Date().toISOString());
    console.log("Is upcoming:", isUpcoming);

    if (isUpcoming) {
      console.log("✅ Tomorrow's class would be shown in ClassesList!");
    } else {
      console.log("❌ Tomorrow's class would NOT be shown in ClassesList");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

testUpdatedLogic();
