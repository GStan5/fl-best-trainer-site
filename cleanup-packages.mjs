// Script to clean up packages - keep only the $400 weightlifting package
import sql from "./lib/database.js";

async function cleanupPackages() {
  try {
    console.log("🧹 Cleaning up packages database...");

    // First, let's see what packages we currently have
    const currentPackages = await sql`
      SELECT id, name, price, sessions_included 
      FROM packages 
      ORDER BY price DESC
    `;
    
    console.log("📦 Current packages:");
    currentPackages.forEach(pkg => {
      console.log(`  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`);
    });

    // Keep only the $400 package (assuming it's the 10-session weightlifting package)
    // Delete all packages that are NOT the $400 package
    const deletedPackages = await sql`
      DELETE FROM packages 
      WHERE price != 400 OR sessions_included != 10
      RETURNING name, price, sessions_included
    `;

    if (deletedPackages.length > 0) {
      console.log("\n🗑️ Deleted packages:");
      deletedPackages.forEach(pkg => {
        console.log(`  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`);
      });
    } else {
      console.log("\n✅ No packages to delete - only the $400 package exists");
    }

    // Check what remains
    const remainingPackages = await sql`
      SELECT id, name, price, sessions_included 
      FROM packages 
      ORDER BY price DESC
    `;

    console.log("\n📦 Remaining packages:");
    remainingPackages.forEach(pkg => {
      console.log(`  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`);
    });

    if (remainingPackages.length === 1) {
      console.log("\n✅ Success! Only your $400 package remains in the database.");
      console.log("You can now easily edit its price through the admin panel at /admin → Packages tab");
    } else {
      console.log(`\n⚠️ Warning: ${remainingPackages.length} packages remain. Expected only 1.`);
    }

  } catch (error) {
    console.error("❌ Error cleaning up packages:", error);
  } finally {
    process.exit(0);
  }
}

cleanupPackages();