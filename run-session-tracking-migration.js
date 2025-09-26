require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log("Starting session tracking migration...");

    // Add weightlifting_classes_booked field
    await sql(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS weightlifting_classes_booked INTEGER DEFAULT 0
    `);

    // Update existing users
    await sql(`
      UPDATE users 
      SET weightlifting_classes_booked = 0 
      WHERE weightlifting_classes_booked IS NULL
    `);

    // Add completed_at field to bookings
    await sql(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL
    `);

    console.log("✅ Session tracking migration completed successfully!");

    // Show updated schema
    const userSchema = await sql(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE '%classes%'
      ORDER BY column_name
    `);

    console.log("User session columns:", userSchema);
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

runMigration();
