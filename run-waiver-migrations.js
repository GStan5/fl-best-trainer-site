// Script to run waiver-related database migrations
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function runWaiverMigrations() {
  try {
    console.log("🔧 Running waiver-related database migrations...");

    // Read DATABASE_URL from .env.local
    let databaseUrl;
    try {
      const envContent = fs.readFileSync(".env.local", "utf8");
      const dbLine = envContent
        .split("\n")
        .find((line) => line.startsWith("DATABASE_URL="));
      if (dbLine) {
        databaseUrl = dbLine.split("=")[1].trim().replace(/['"]/g, "");
      }
    } catch (error) {
      console.log("⚠️ Could not read .env.local, using environment variable");
    }

    if (!databaseUrl) {
      databaseUrl = process.env.DATABASE_URL;
    }

    if (!databaseUrl) {
      console.log("❌ DATABASE_URL not found");
      return;
    }

    const sql = neon(databaseUrl);

    // Run user fields migration
    console.log("📝 Running user fields migration...");

    // Add user fields columns
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS waiver_signed_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS waiver_ip_address INET,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)
    `;

    // Update existing users to split name
    await sql`
      UPDATE users 
      SET 
          first_name = CASE 
              WHEN first_name IS NULL AND name IS NOT NULL THEN 
                  SPLIT_PART(name, ' ', 1)
              ELSE first_name 
          END,
          last_name = CASE 
              WHEN last_name IS NULL AND name IS NOT NULL AND POSITION(' ' IN name) > 0 THEN 
                  SUBSTRING(name FROM POSITION(' ' IN name) + 1)
              ELSE last_name 
          END
      WHERE first_name IS NULL OR last_name IS NULL
    `;

    console.log("✅ User fields migration completed");

    // Run waiver PDF column migration
    console.log("📄 Running waiver PDF column migration...");

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS waiver_pdf_data BYTEA,
      ADD COLUMN IF NOT EXISTS waiver_pdf_filename VARCHAR(255)
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_waiver_signed ON users(waiver_signed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed)`;

    console.log("✅ Waiver PDF column migration completed");

    // Verify the columns exist by checking a sample user
    console.log("🔍 Verifying database schema...");
    const testResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('waiver_signed', 'waiver_signed_date', 'onboarding_completed', 'waiver_pdf_data', 'waiver_pdf_filename')
      ORDER BY column_name
    `;

    console.log(
      "📊 Found waiver-related columns:",
      testResult.map((r) => r.column_name)
    );

    if (testResult.length >= 4) {
      console.log("✅ All required waiver columns are present in the database");
    } else {
      console.log("⚠️ Some waiver columns may be missing");
    }

    console.log("🎉 Waiver migrations completed successfully!");
  } catch (error) {
    console.error("❌ Error running waiver migrations:", error);
  }
}

// Run the migrations
runWaiverMigrations();
