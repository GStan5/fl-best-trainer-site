const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    const migration = fs.readFileSync(
      "./database/add-user-fields-migration.sql",
      "utf8"
    );
    await sql`${migration}`;
    console.log("✅ Migration completed successfully!");

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

runMigration();
