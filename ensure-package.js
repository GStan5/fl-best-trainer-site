// Script to ensure your $400 package exists
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function ensurePackageExists() {
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

    console.log("🔍 Checking for $400 package...");

    // Check if the $400 package exists
    const existingPackages = await sql`
      SELECT * FROM packages 
      WHERE price = 400 AND sessions_included = 10
    `;

    if (existingPackages.length > 0) {
      console.log("✅ $400 package already exists:");
      console.log(`   Name: ${existingPackages[0].name}`);
      console.log(`   Price: $${existingPackages[0].price}`);
      console.log(`   Sessions: ${existingPackages[0].sessions_included}`);
      console.log(`   Active: ${existingPackages[0].is_active}`);
    } else {
      console.log("❌ $400 package not found. Creating it...");

      const newPackage = await sql`
        INSERT INTO packages (
          name, 
          description, 
          sessions_included, 
          price, 
          duration_days,
          is_active
        ) VALUES (
          '10-Class Weightlifting Package',
          'Small group training • 4-person max • Expert instruction',
          10,
          400.00,
          90,
          true
        )
        RETURNING *
      `;

      console.log("✅ Created new $400 package:");
      console.log(`   Name: ${newPackage[0].name}`);
      console.log(`   Price: $${newPackage[0].price}`);
      console.log(`   Sessions: ${newPackage[0].sessions_included}`);
      console.log(`   ID: ${newPackage[0].id}`);
    }

    // Show all active packages
    const allActive = await sql`
      SELECT name, price, sessions_included, is_active
      FROM packages 
      WHERE is_active = true
      ORDER BY price DESC
    `;

    console.log(`\n📦 All active packages (${allActive.length}):`);
    allActive.forEach((pkg) => {
      console.log(
        `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

ensurePackageExists();
