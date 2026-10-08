// Script to create/update the weightlifting package in database
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function syncPackage() {
  try {
    console.log("🔄 Syncing weightlifting package to database...");

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

    // Check if our weightlifting package exists
    const existing = await sql`
      SELECT * FROM packages 
      WHERE name ILIKE '%weightlifting%' 
      OR name ILIKE '%10-class%'
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing package
      const updated = await sql`
        UPDATE packages 
        SET 
          name = '10-Class Weightlifting Package',
          description = 'Small group training • 4-person max • Expert instruction',
          sessions_included = 10,
          price = 400.00,
          duration_days = 90,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;

      console.log("✅ Updated existing package:");
      console.log(`   ID: ${updated[0].id}`);
      console.log(`   Name: ${updated[0].name}`);
      console.log(`   Price: $${updated[0].price}`);
      console.log(`   Sessions: ${updated[0].sessions_included}`);
    } else {
      // Create new package
      const created = await sql`
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

      console.log("✅ Created new package:");
      console.log(`   ID: ${created[0].id}`);
      console.log(`   Name: ${created[0].name}`);
      console.log(`   Price: $${created[0].price}`);
      console.log(`   Sessions: ${created[0].sessions_included}`);
    }

    // Show all active packages
    const allPackages = await sql`
      SELECT id, name, price, sessions_included, is_active
      FROM packages 
      WHERE is_active = true
      ORDER BY price DESC
    `;

    console.log(`\n📦 All active packages (${allPackages.length}):`);
    allPackages.forEach((pkg) => {
      console.log(
        `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
      );
    });

    console.log(
      "\n🎉 Database sync complete! Now you can edit prices from the admin panel."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

syncPackage();
