// Check and fix package expiration settings
const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function fixPackageExpiration() {
  try {
    console.log("🔍 Checking package expiration settings...\n");

    const sql = neon(process.env.DATABASE_URL);

    // Check current packages
    const packages = await sql`
      SELECT id, name, sessions_included, price, duration_days 
      FROM packages 
      WHERE is_active = true 
      ORDER BY sessions_included
    `;

    console.log("Current packages:");
    packages.forEach(p => {
      console.log(`- ${p.name}: ${p.sessions_included} sessions, ${p.duration_days} days duration`);
    });

    // Update packages to never expire (set to a very high number like 10 years)
    const neverExpireDays = 3650; // 10 years

    for (const pkg of packages) {
      if (pkg.duration_days < neverExpireDays) {
        await sql`
          UPDATE packages 
          SET duration_days = ${neverExpireDays}
          WHERE id = ${pkg.id}
        `;
        console.log(`✅ Updated ${pkg.name}: ${pkg.duration_days} days → ${neverExpireDays} days (never expires)`);
      } else {
        console.log(`✅ ${pkg.name}: Already set to never expire (${pkg.duration_days} days)`);
      }
    }

    // Check if there are any user packages that might be expired
    const expiredUserPackages = await sql`
      SELECT up.*, p.name as package_name, u.email
      FROM user_packages up 
      JOIN packages p ON up.package_id = p.id
      JOIN users u ON up.user_id = u.id
      WHERE up.expiry_date < CURRENT_DATE AND up.is_active = true
    `;

    if (expiredUserPackages.length > 0) {
      console.log(`\n⚠️  Found ${expiredUserPackages.length} expired user packages:`);
      expiredUserPackages.forEach(up => {
        console.log(`- ${up.email}: ${up.package_name} (expired: ${up.expiry_date})`);
      });
      
      // Extend all expired packages
      await sql`
        UPDATE user_packages 
        SET expiry_date = CURRENT_DATE + INTERVAL '10 years'
        WHERE expiry_date < CURRENT_DATE AND is_active = true
      `;
      console.log("✅ Extended all expired user packages by 10 years");
    } else {
      console.log("\n✅ No expired user packages found");
    }

    console.log("\n🎉 Package expiration settings updated - sessions will never expire!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixPackageExpiration();