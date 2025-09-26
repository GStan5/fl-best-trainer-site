const { neon } = require("@neondatabase/serverless");

// Get DATABASE_URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function addRecurringClassFields() {
  try {
    console.log("🔄 Adding recurring class functionality to database...");

    // Add recurring class fields to existing classes table
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurring_days TEXT[]`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurring_start_date DATE`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurring_end_date DATE`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS parent_recurring_id UUID`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurrence_rule JSONB`;
    console.log("✅ Added recurring class fields to classes table");

    // Create a separate table to track recurring class templates
    await sql`
      CREATE TABLE IF NOT EXISTS recurring_class_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor VARCHAR(255) NOT NULL,
        class_type VARCHAR(100),
        difficulty_level VARCHAR(50),
        location VARCHAR(255),
        duration_minutes INTEGER,
        max_participants INTEGER,
        price_per_session DECIMAL(10,2),
        credits_required INTEGER DEFAULT 1,
        equipment_needed TEXT,
        prerequisites TEXT,
        class_goals TEXT,
        intensity_level INTEGER,
        waitlist_enabled BOOLEAN DEFAULT TRUE,
        waitlist_capacity INTEGER DEFAULT 5,
        auto_confirm_booking BOOLEAN DEFAULT TRUE,
        cancellation_deadline_hours INTEGER DEFAULT 24,
        safety_requirements TEXT,
        age_restrictions VARCHAR(100),
        modifications_available TEXT,
        
        -- Recurring schedule fields
        recurring_days TEXT[] NOT NULL, -- ['monday', 'wednesday', 'friday']
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE, -- If null, recurring indefinitely
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Created recurring_class_templates table");

    // Create index for better query performance
    await sql`CREATE INDEX IF NOT EXISTS idx_classes_parent_recurring_id ON classes(parent_recurring_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_classes_recurring_days ON classes USING GIN(recurring_days)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recurring_templates_days ON recurring_class_templates USING GIN(recurring_days)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recurring_templates_active ON recurring_class_templates(is_active)`;
    console.log("✅ Added database indexes for performance");

    console.log("🎉 Recurring class functionality added successfully!");
    console.log("");
    console.log("📋 Summary of new features:");
    console.log("- ✅ is_recurring: Boolean flag for recurring classes");
    console.log("- ✅ recurring_days: Array of days when class repeats");
    console.log("- ✅ recurring_start_date: When the recurring pattern starts");
    console.log(
      "- ✅ recurring_end_date: When the recurring pattern ends (optional)"
    );
    console.log(
      "- ✅ parent_recurring_id: Links individual classes to their template"
    );
    console.log(
      "- ✅ recurring_class_templates: Master templates for recurring classes"
    );
    console.log("- ✅ Performance indexes for fast queries");
  } catch (error) {
    console.error("❌ Failed to add recurring class functionality:", error);
  }
}

addRecurringClassFields();
