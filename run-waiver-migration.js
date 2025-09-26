const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const sql = neon(process.env.DATABASE_URL);

async function runWaiverMigration() {
  try {
    const migration = fs.readFileSync(
      "./database/add-waiver-pdf-column.sql",
      "utf8"
    );
    console.log("Running waiver migration...");
    await sql`${migration}`;
    console.log("✅ Waiver PDF migration completed successfully!");

    // Check the updated schema
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    console.log("📋 Updated users table schema:");
    result.forEach((col) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

runWaiverMigration();
