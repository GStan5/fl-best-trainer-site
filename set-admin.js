// Script to set gavinstanifer@live.com as admin
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function setAdminUser() {
  try {
    console.log("👤 Setting up admin user...");

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

    const adminEmail = "gavinstanifer@live.com";

    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${adminEmail}
    `;

    if (existingUser.length > 0) {
      // Update existing user to be admin
      const updatedUser = await sql`
        UPDATE users 
        SET is_admin = true, updated_at = CURRENT_TIMESTAMP
        WHERE email = ${adminEmail}
        RETURNING *
      `;

      console.log("✅ Updated existing user to admin:");
      console.log(`   Email: ${updatedUser[0].email}`);
      console.log(`   Name: ${updatedUser[0].name}`);
      console.log(`   Admin: ${updatedUser[0].is_admin}`);
    } else {
      // Create new admin user
      const newUser = await sql`
        INSERT INTO users (email, name, is_admin)
        VALUES (${adminEmail}, 'Gavin Stanifer', true)
        RETURNING *
      `;

      console.log("✅ Created new admin user:");
      console.log(`   Email: ${newUser[0].email}`);
      console.log(`   Name: ${newUser[0].name}`);
      console.log(`   Admin: ${newUser[0].is_admin}`);
    }

    // Show all admin users
    const allAdmins = await sql`
      SELECT email, name, is_admin, created_at
      FROM users 
      WHERE is_admin = true
      ORDER BY created_at DESC
    `;

    console.log(`\n👑 All admin users (${allAdmins.length}):`);
    allAdmins.forEach((admin) => {
      console.log(
        `   - ${admin.name} (${admin.email}) - Admin: ${admin.is_admin}`
      );
    });

    console.log(
      "\n🎉 Admin setup complete! You can now edit packages from the admin panel."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

setAdminUser();
