// Script to delete all packages except the 10-class weightlifting package and set it to $1
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function cleanupAndUpdatePackage() {
  try {
    console.log("🧹 Cleaning up packages and updating price...");

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

    console.log("📦 Current packages:");
    const allPackages = await sql`
      SELECT id, name, price, sessions_included, is_active
      FROM packages 
      ORDER BY price DESC
    `;

    allPackages.forEach((pkg) => {
      console.log(
        `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions) - Active: ${pkg.is_active}`
      );
    });

    // Find the 10-class weightlifting package
    const weightliftingPackage = allPackages.find(
      (pkg) =>
        pkg.sessions_included === 10 &&
        pkg.name.toLowerCase().includes("weightlifting")
    );

    if (!weightliftingPackage) {
      console.log("❌ 10-class weightlifting package not found!");
      return;
    }

    console.log(
      `\n✅ Found weightlifting package: ${weightliftingPackage.name} (ID: ${weightliftingPackage.id})`
    );

    // Delete all other packages
    const deletedPackages = await sql`
      DELETE FROM packages 
      WHERE id != ${weightliftingPackage.id}
      RETURNING name, price, sessions_included
    `;

    if (deletedPackages.length > 0) {
      console.log("\n🗑️ Deleted packages:");
      deletedPackages.forEach((pkg) => {
        console.log(
          `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
        );
      });
    }

    // Update the weightlifting package price to $1
    const updatedPackage = await sql`
      UPDATE packages 
      SET 
        price = 1.00,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${weightliftingPackage.id}
      RETURNING *
    `;

    console.log("\n💰 Updated package price:");
    console.log(
      `   - ${updatedPackage[0].name}: $${updatedPackage[0].price} (${updatedPackage[0].sessions_included} sessions)`
    );

    // Show final result
    const finalPackages = await sql`
      SELECT id, name, price, sessions_included, is_active
      FROM packages 
      WHERE is_active = true
      ORDER BY price DESC
    `;

    console.log(`\n📦 Final packages (${finalPackages.length}):`);
    finalPackages.forEach((pkg) => {
      console.log(
        `   - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
      );
    });

    console.log(
      "\n🎉 Done! Your 10-class weightlifting package is now $1 and all other packages are deleted."
    );
    console.log("The price will automatically update on your website!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

cleanupAndUpdatePackage();
