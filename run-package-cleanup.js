// Database cleanup script - keep only the $400 package
const { neon } = require("@neondatabase/serverless");

async function cleanupPackages() {
  try {
    // Load environment variables
    require("dotenv").config({ path: ".env.local" });

    if (!process.env.DATABASE_URL) {
      console.log("❌ DATABASE_URL not found in .env.local");
      return;
    }

    const sql = neon(process.env.DATABASE_URL);

    console.log("🧹 Cleaning up packages database...");

    // First, let's see what packages we currently have
    const currentPackages = await sql`
      SELECT id, name, price, sessions_included 
      FROM packages 
      ORDER BY price DESC
    `;

    console.log("📦 Current packages:");
    currentPackages.forEach((pkg) => {
      console.log(
        `  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
      );
    });

    // Keep only packages that are $400 and have 10 sessions
    const packagesToKeep = currentPackages.filter(
      (pkg) => pkg.price == 400 && pkg.sessions_included == 10
    );

    if (packagesToKeep.length === 0) {
      console.log("\n❌ No $400/10-session package found!");
      return;
    }

    if (packagesToKeep.length > 1) {
      console.log(
        "\n⚠️ Multiple $400/10-session packages found. Keeping the first one."
      );
    }

    const keepPackageId = packagesToKeep[0].id;
    console.log(
      `\n✅ Keeping package: ${packagesToKeep[0].name} (ID: ${keepPackageId})`
    );

    // Delete all packages except the one we want to keep
    const deletedPackages = await sql`
      DELETE FROM packages 
      WHERE id != ${keepPackageId}
      RETURNING name, price, sessions_included
    `;

    if (deletedPackages.length > 0) {
      console.log("\n🗑️ Deleted packages:");
      deletedPackages.forEach((pkg) => {
        console.log(
          `  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
        );
      });
    }

    // Check what remains
    const remainingPackages = await sql`
      SELECT id, name, price, sessions_included 
      FROM packages 
      ORDER BY price DESC
    `;

    console.log("\n📦 Remaining packages:");
    remainingPackages.forEach((pkg) => {
      console.log(
        `  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
      );
    });

    console.log(
      "\n✅ Done! You can now edit your package price at /admin → Packages tab"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

cleanupPackages();
