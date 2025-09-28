// Script to check if waiver PDFs are being saved to the database
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function checkWaiverPDFs() {
  try {
    console.log("🔍 Checking waiver PDF storage in database...");

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

    // Check for users with waiver data
    console.log("📊 Checking users with waiver signatures...");
    const usersWithWaivers = await sql`
      SELECT 
        email,
        name,
        waiver_signed,
        waiver_signed_date,
        waiver_pdf_filename,
        CASE 
          WHEN waiver_pdf_data IS NOT NULL THEN LENGTH(waiver_pdf_data)
          ELSE 0
        END as pdf_size_bytes,
        onboarding_completed
      FROM users 
      WHERE waiver_signed = true
      ORDER BY waiver_signed_date DESC
    `;

    if (usersWithWaivers.length === 0) {
      console.log("⚠️ No users found with signed waivers");
      return;
    }

    console.log(
      `✅ Found ${usersWithWaivers.length} users with signed waivers:`
    );

    usersWithWaivers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Waiver Signed: ${user.waiver_signed}`);
      console.log(`   Signed Date: ${user.waiver_signed_date}`);
      console.log(`   PDF Filename: ${user.waiver_pdf_filename || "Not set"}`);
      console.log(`   PDF Size: ${user.pdf_size_bytes} bytes`);
      console.log(`   Onboarding Complete: ${user.onboarding_completed}`);

      if (user.pdf_size_bytes > 0) {
        console.log(`   ✅ PDF is stored in database`);
      } else {
        console.log(`   ❌ PDF is NOT stored in database`);
      }
    });

    // Check for any users who signed waivers but don't have PDF data
    const missingPDFs = usersWithWaivers.filter(
      (user) => user.pdf_size_bytes === 0
    );
    if (missingPDFs.length > 0) {
      console.log(
        `\n⚠️ ${missingPDFs.length} users have signed waivers but missing PDF data:`
      );
      missingPDFs.forEach((user) => {
        console.log(`   - ${user.email} (signed: ${user.waiver_signed_date})`);
      });
    } else {
      console.log(`\n✅ All users with signed waivers have PDF data stored!`);
    }
  } catch (error) {
    console.error("❌ Error checking waiver PDFs:", error);
  }
}

// Run the check
checkWaiverPDFs();
