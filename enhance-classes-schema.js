const { neon } = require("@neondatabase/serverless");

// Get DATABASE_URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function enhanceClassesSchema() {
  try {
    console.log("🔄 Enhancing classes table schema...");

    // Add pricing & business fields
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS price_per_session DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS credits_required INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 24
    `;
    console.log("✅ Added pricing & business fields");

    // Add class details fields
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS prerequisites TEXT,
      ADD COLUMN IF NOT EXISTS class_goals TEXT,
      ADD COLUMN IF NOT EXISTS intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10)
    `;
    console.log("✅ Added class details fields");

    // Add capacity & booking fields
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS waitlist_capacity INTEGER DEFAULT 5,
      ADD COLUMN IF NOT EXISTS auto_confirm_booking BOOLEAN DEFAULT TRUE
    `;
    console.log("✅ Added capacity & booking fields");

    // Add scheduling fields
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS recurring_pattern VARCHAR(50),
      ADD COLUMN IF NOT EXISTS class_series_id UUID,
      ADD COLUMN IF NOT EXISTS registration_opens TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS registration_closes TIMESTAMP WITH TIME ZONE
    `;
    console.log("✅ Added scheduling fields");

    // Add content & safety fields
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS safety_requirements TEXT,
      ADD COLUMN IF NOT EXISTS age_restrictions VARCHAR(100),
      ADD COLUMN IF NOT EXISTS modifications_available TEXT
    `;
    console.log("✅ Added content & safety fields");

    // Update existing classes with default values where it makes sense
    await sql`
      UPDATE classes 
      SET 
        duration_minutes = EXTRACT(EPOCH FROM (end_time::time - start_time::time))/60,
        credits_required = 1,
        cancellation_deadline_hours = 24,
        waitlist_enabled = true,
        waitlist_capacity = 3,
        auto_confirm_booking = true,
        intensity_level = CASE 
          WHEN difficulty_level = 'Beginner' THEN 4
          WHEN difficulty_level = 'Intermediate' THEN 6
          WHEN difficulty_level = 'Advanced' THEN 8
          ELSE 5
        END
      WHERE duration_minutes IS NULL
    `;
    console.log("✅ Updated existing classes with calculated values");

    console.log("🎉 Classes schema enhancement complete!");
  } catch (error) {
    console.error("❌ Schema enhancement failed:", error);
  }
}

enhanceClassesSchema();
