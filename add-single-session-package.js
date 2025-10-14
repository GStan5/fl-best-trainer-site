// Script to add a new single-session package to database
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function addSingleSessionPackage() {
  try {
    console.log("🔄 Adding single-session package to database...");

    const sql = neon(process.env.DATABASE_URL);

    // Check if single-session package already exists
    const existing = await sql`
      SELECT * FROM packages 
      WHERE sessions_included = 1
      AND price = 55.00
      LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("✅ Single-session package already exists:");
      console.log(`   ID: ${existing[0].id}`);
      console.log(`   Name: ${existing[0].name}`);
      console.log(`   Price: $${existing[0].price}`);
      console.log(`   Sessions: ${existing[0].sessions_included}`);
      return existing[0];
    }

    // Create new single-session package
    const created = await sql`
      INSERT INTO packages (
        name, 
        description, 
        sessions_included, 
        price, 
        duration_days,
        is_active
      ) VALUES (
        'Single Session Drop-In',
        'Perfect for trying out our weightlifting classes • No commitment required',
        1,
        55.00,
        30,
        true
      )
      RETURNING *
    `;

    console.log("✅ Created new single-session package:");
    console.log(`   ID: ${created[0].id}`);
    console.log(`   Name: ${created[0].name}`);
    console.log(`   Price: $${created[0].price}`);
    console.log(`   Sessions: ${created[0].sessions_included}`);
    console.log(`   Duration: ${created[0].duration_days} days`);

    // Show all active packages
    const allPackages = await sql`
      SELECT id, name, price, sessions_included, is_active
      FROM packages 
      WHERE is_active = true
      ORDER BY sessions_included ASC, price ASC
    `;

    console.log(`\n📦 All active packages (${allPackages.length}):`);
    allPackages.forEach((pkg) => {
      const pricePerSession = (pkg.price / pkg.sessions_included).toFixed(2);
      console.log(
        `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions) - $${pricePerSession}/session`
      );
    });

    return created[0];
  } catch (error) {
    console.error("❌ Error adding single-session package:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addSingleSessionPackage()
    .then(() => {
      console.log("\n🎉 Single-session package setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to add package:", error);
      process.exit(1);
    });
}

module.exports = { addSingleSessionPackage };