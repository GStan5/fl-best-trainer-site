// Quick debug script to see what's in the packages table
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function checkPackages() {
  try {
    // Try to read DATABASE_URL from .env.local
    const envContent = fs.readFileSync(".env.local", "utf8");
    const databaseUrl = envContent
      .split("\n")
      .find((line) => line.startsWith("DATABASE_URL="));

    if (!databaseUrl) {
      console.log("❌ DATABASE_URL not found in .env.local");
      return;
    }

    const url = databaseUrl.split("=")[1].trim();
    const sql = neon(url);

    console.log("🔍 Checking packages table...");

    // Get all packages regardless of status
    const allPackages = await sql`
      SELECT 
        id,
        name,
        description,
        sessions_included,
        price,
        duration_days,
        is_active,
        created_at
      FROM packages 
      ORDER BY created_at DESC
    `;

    console.log(`📦 Found ${allPackages.length} total packages:`);

    if (allPackages.length === 0) {
      console.log("❌ No packages found in database!");
      console.log(
        "💡 You may need to insert your $400 package into the database."
      );
    } else {
      allPackages.forEach((pkg, index) => {
        console.log(`\n${index + 1}. ${pkg.name}`);
        console.log(`   Price: $${pkg.price}`);
        console.log(`   Sessions: ${pkg.sessions_included}`);
        console.log(`   Active: ${pkg.is_active}`);
        console.log(`   Duration: ${pkg.duration_days} days`);
        console.log(`   ID: ${pkg.id}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkPackages();
